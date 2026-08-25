import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID, createHmac } from 'node:crypto';
import {
  ConflictException,
  Inject,
  Injectable,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { z } from 'zod';
import request from 'supertest';

import { RocketsCoreModule } from '../rockets-core.module';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { operationResource } from '../zod/zod-operation-resource';
import type { OperationContext } from '../domain/interfaces/operation-resource.interface';
import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import {
  IDEMPOTENCY_STORE_TOKEN,
  type IdempotencyStoreInterface,
} from '../domain/interfaces/idempotency.interface';
import { InMemoryIdempotencyStore } from '../infrastructure/idempotency/in-memory-idempotency-store.service';
import { hashIdempotentRequest } from '../infrastructure/idempotency/hash-idempotent-request';
import {
  createWebhookSignatureVerifier,
  type WebhookSignatureVerifier,
} from '../infrastructure/webhooks/verify-webhook-signature';

function firstHeaderValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * `Bearer <user-id>` — enough to give the scoping test below two
 * genuinely different authenticated principals. Unauthenticated
 * requests stay `matched: false`, which the `public: true` routes do not
 * care about and the authenticated one 401s on.
 */
@Injectable()
class BearerUserAuthProvider implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const header = firstHeaderValue(request.headers['authorization']);
    if (header === undefined) return { matched: false };
    const id = header.replace(/^Bearer /i, '');
    return { matched: true, user: { id, sub: id } };
  }
}

/**
 * Nest applies an operation's DECLARED status before the handler runs
 * and does not re-apply it afterwards, so the response escape hatch is
 * how an operation answers with a different one — and, on the replay
 * path, how it restores the status the ORIGINAL request answered with
 * instead of silently substituting the declared one.
 */
function setResponseStatus(
  ctx: OperationContext<unknown, object>,
  status: number,
): void {
  (ctx.response.raw as { status(code: number): unknown }).status(status);
}

interface Order {
  readonly id: string;
  readonly sku: string;
  readonly qty: number;
}

let ordersCreated = 0;

/**
 * The documented pattern (CONFIGURATION.md §6e): a handler CLASS reads
 * the store via constructor DI, checks the key BEFORE doing the real
 * work, and replays the stored result on a match instead of re-running
 * it — `ordersCreated` below is the side effect a real handler would
 * have (charge a card, send an email); the test asserts it increments
 * exactly once across a replayed request.
 */
@Injectable()
class CreateOrderHandler {
  constructor(
    @Inject(IDEMPOTENCY_STORE_TOKEN)
    private readonly store: IdempotencyStoreInterface,
  ) {}

  async handle(
    ctx: OperationContext<{ sku: string; qty: number }>,
  ): Promise<Order> {
    const idempotencyKey = firstHeaderValue(
      ctx.request.headers['idempotency-key'],
    );
    const requestHash = hashIdempotentRequest(ctx.input);

    if (idempotencyKey !== undefined) {
      const existing = await this.store.get(idempotencyKey);
      if (existing !== undefined) {
        if (existing.requestHash !== requestHash) {
          throw new ConflictException(
            `Idempotency-Key "${idempotencyKey}" was already used with a different request body`,
          );
        }
        // The STORED status, not the operation's declared one —
        // otherwise a 202 "queued" reply replays as a 201 "created".
        setResponseStatus(ctx, existing.status);
        // Compatibility cast: the store's `body` is `unknown` by
        // design (it holds ANY operation's output), but this handler
        // is the only writer for keys under this operation, so it is
        // always the `Order` shape this same handler stored.
        return existing.body as Order;
      }
    }

    ordersCreated += 1;
    const order = { id: randomUUID(), sku: ctx.input.sku, qty: ctx.input.qty };
    // A bulk order is QUEUED, not created — a real operation whose
    // status is not the declared one, which is what makes the replay
    // assertion below meaningful.
    const status = ctx.input.qty > 10 ? 202 : 201;
    setResponseStatus(ctx, status);

    if (idempotencyKey !== undefined) {
      await this.store.set(
        idempotencyKey,
        { status, body: order, requestHash },
        10 * 60_000,
      );
    }
    return order;
  }
}

interface Invoice {
  readonly id: string;
  readonly owner: string;
  readonly amount: number;
}

let invoicesCreated = 0;

/**
 * The AUTHENTICATED variant of the same pattern. `Idempotency-Key` is a
 * client-chosen string, so the store must be keyed by the principal the
 * guard resolved plus the header value — never the header value alone,
 * which two tenants routinely pick identically and which would then
 * replay one user's response body to another.
 */
@Injectable()
class CreateInvoiceHandler {
  constructor(
    @Inject(IDEMPOTENCY_STORE_TOKEN)
    private readonly store: IdempotencyStoreInterface,
  ) {}

  async handle(ctx: OperationContext<{ amount: number }>): Promise<Invoice> {
    const user = ctx.user;
    if (user === undefined) {
      throw new UnauthorizedException('missing principal');
    }
    const rawKey = firstHeaderValue(ctx.request.headers['idempotency-key']);
    const scopedKey = rawKey === undefined ? undefined : `${user.id}:${rawKey}`;
    const requestHash = hashIdempotentRequest(ctx.input);

    if (scopedKey !== undefined) {
      const existing = await this.store.get(scopedKey);
      if (existing !== undefined) {
        if (existing.requestHash !== requestHash) {
          throw new ConflictException(
            `Idempotency-Key "${rawKey}" was already used with a different request body`,
          );
        }
        setResponseStatus(ctx, existing.status);
        // Same compatibility cast as above, same single-writer reason.
        return existing.body as Invoice;
      }
    }

    invoicesCreated += 1;
    const invoice = {
      id: randomUUID(),
      owner: user.id,
      amount: ctx.input.amount,
    };

    if (scopedKey !== undefined) {
      await this.store.set(
        scopedKey,
        { status: 201, body: invoice, requestHash },
        10 * 60_000,
      );
    }
    return invoice;
  }
}

let raceRuns = 0;
let raceEntered = 0;
let releaseRace: (() => void) | undefined;
const raceBarrier = new Promise<void>((resolve) => {
  releaseRace = resolve;
});

/**
 * Pins the CONTRACT, not a wish: `get`/`set` has no atomic reserve, so
 * two requests that both miss before either stores BOTH run the real
 * work. The barrier makes that interleaving deterministic instead of
 * hoping for it under load (a 20-request probe hit 7 executions).
 *
 * This test exists so the "runs the handler once" phrasing cannot come
 * back without someone seeing it go red. Closing the gap needs an
 * atomic reserve on the port — see the interface docs.
 */
@Injectable()
class RaceHandler {
  constructor(
    @Inject(IDEMPOTENCY_STORE_TOKEN)
    private readonly store: IdempotencyStoreInterface,
  ) {}

  async handle(ctx: OperationContext<{ n: number }>): Promise<{ ok: boolean }> {
    const key = firstHeaderValue(ctx.request.headers['idempotency-key']);
    const requestHash = hashIdempotentRequest(ctx.input);

    if (key !== undefined) {
      const existing = await this.store.get(key);
      if (existing !== undefined) return existing.body as { ok: boolean };
    }

    raceEntered += 1;
    if (raceEntered >= 2) releaseRace?.();
    await raceBarrier;

    raceRuns += 1;
    const body = { ok: true };
    if (key !== undefined) {
      await this.store.set(key, { status: 200, body, requestHash }, 60_000);
    }
    return body;
  }
}

const WEBHOOK_SECRET = 'whsec_e2e_test';
const WEBHOOK_VERIFIER = Symbol.for('rockets-core-e2e/webhook-verifier');
let webhooksAccepted = 0;

/**
 * The documented shape: the secret is bound ONCE in a provider factory,
 * so a missing one fails the boot (asserted below) rather than turning
 * every delivery into a silent 401. The handler injects the bound
 * verifier and never sees the secret.
 */
const webhookVerifierProvider = {
  provide: WEBHOOK_VERIFIER,
  useFactory: (): WebhookSignatureVerifier =>
    createWebhookSignatureVerifier({ secret: WEBHOOK_SECRET }),
};

/**
 * Reads the raw bytes off `ctx.request.raw` — populated by Nest's own
 * `rawBody: true` app option (`app.rawBody` on the native request), not
 * anything this package adds. The parsed/re-serialized body would not
 * byte-match what the provider signed.
 */
@Injectable()
class WebhookHandler {
  constructor(
    @Inject(WEBHOOK_VERIFIER)
    private readonly verify: WebhookSignatureVerifier,
  ) {}

  handle(ctx: OperationContext<{ event: string }>): { received: boolean } {
    const raw = ctx.request.raw as { rawBody?: Buffer };
    const signature = firstHeaderValue(
      ctx.request.headers['x-webhook-signature'],
    );
    if (signature === undefined || raw.rawBody === undefined) {
      throw new UnauthorizedException('missing signature');
    }
    if (!this.verify(raw.rawBody, signature)) {
      throw new UnauthorizedException('invalid signature');
    }
    webhooksAccepted += 1;
    return { received: true };
  }
}

const ops = operationResource({
  path: 'commerce',
  public: true,
  providers: [
    { provide: IDEMPOTENCY_STORE_TOKEN, useClass: InMemoryIdempotencyStore },
    webhookVerifierProvider,
  ],
  operations: (op) => ({
    createOrder: op.write({
      status: 201,
      input: z.object({ sku: z.string(), qty: z.number().int().positive() }),
      output: z.object({ id: z.string(), sku: z.string(), qty: z.number() }),
      handler: CreateOrderHandler,
    }),
    webhook: op.write({
      status: 200,
      input: z.object({ event: z.string() }),
      output: z.object({ received: z.boolean() }),
      handler: WebhookHandler,
    }),
    race: op.write({
      status: 200,
      input: z.object({ n: z.number() }),
      output: z.object({ ok: z.boolean() }),
      handler: RaceHandler,
    }),
  }),
});

/** Same pattern, behind the guard — see {@link CreateInvoiceHandler}. */
const secureOps = operationResource({
  path: 'billing',
  providers: [
    { provide: IDEMPOTENCY_STORE_TOKEN, useClass: InMemoryIdempotencyStore },
  ],
  operations: (op) => ({
    createInvoice: op.write({
      status: 201,
      input: z.object({ amount: z.number().int().positive() }),
      output: z.object({
        id: z.string(),
        owner: z.string(),
        amount: z.number(),
      }),
      handler: CreateInvoiceHandler,
    }),
  }),
});

describe('idempotency keys + inbound webhooks (e2e, issue #59)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(BearerUserAuthProvider),
          providers: [BearerUserAuthProvider],
          resources: [ops, secureOps],
          global: true,
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
    }).compile();

    // rawBody: true is what makes ctx.request.raw.rawBody available —
    // the webhook pattern's whole point. Must be the ONLY argument: the
    // two-arg overload's first parameter is an httpAdapter, and passing
    // `undefined` there makes the runtime treat THIS options object as
    // that unmatched first argument and silently drop it — no type
    // error, just a raw body that's never actually captured.
    app = moduleRef.createNestApplication({ rawBody: true });
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('idempotent write', () => {
    it('runs the handler once and replays the cached result for a repeat key', async () => {
      const before = ordersCreated;
      const body = { sku: 'WIDGET', qty: 2 };

      const first = await request(app.getHttpServer())
        .post('/commerce/createOrder')
        .set('Idempotency-Key', 'order-abc')
        .send(body)
        .expect(201);

      const second = await request(app.getHttpServer())
        .post('/commerce/createOrder')
        .set('Idempotency-Key', 'order-abc')
        .send(body)
        .expect(201);

      expect(second.body).toEqual(first.body);
      expect(ordersCreated).toBe(before + 1);
    });

    it('rejects a reused key with a different request body', async () => {
      await request(app.getHttpServer())
        .post('/commerce/createOrder')
        .set('Idempotency-Key', 'order-conflict')
        .send({ sku: 'WIDGET', qty: 1 })
        .expect(201);

      await request(app.getHttpServer())
        .post('/commerce/createOrder')
        .set('Idempotency-Key', 'order-conflict')
        .send({ sku: 'WIDGET', qty: 99 })
        .expect(409);
    });

    it('without a key, every request runs the handler (no replay)', async () => {
      const before = ordersCreated;
      const body = { sku: 'GADGET', qty: 1 };

      const first = await request(app.getHttpServer())
        .post('/commerce/createOrder')
        .send(body)
        .expect(201);
      const second = await request(app.getHttpServer())
        .post('/commerce/createOrder')
        .send(body)
        .expect(201);

      expect(second.body.id).not.toBe(first.body.id);
      expect(ordersCreated).toBe(before + 2);
    });

    /**
     * "Replays it verbatim" includes the STATUS. The operation declares
     * 201; a bulk order answers 202. Replaying the stored body under
     * the declared status would tell the client a queued job had
     * completed.
     */
    it('replays the ORIGINAL status, not the operation default', async () => {
      const before = ordersCreated;
      const body = { sku: 'PALLET', qty: 50 };

      const first = await request(app.getHttpServer())
        .post('/commerce/createOrder')
        .set('Idempotency-Key', 'order-bulk')
        .send(body)
        .expect(202);

      const second = await request(app.getHttpServer())
        .post('/commerce/createOrder')
        .set('Idempotency-Key', 'order-bulk')
        .send(body)
        .expect(202);

      expect(second.body).toEqual(first.body);
      expect(ordersCreated).toBe(before + 1);
    });

    /**
     * DOCUMENTED LIMITATION, asserted so it cannot be quietly reworded
     * into a guarantee. `get`/`set` cannot express "reserve this key",
     * so two concurrent first-writers both run.
     */
    it('does NOT serialize concurrent first-writers under one key', async () => {
      const [first, second] = await Promise.all([
        request(app.getHttpServer())
          .post('/commerce/race')
          .set('Idempotency-Key', 'race-1')
          .send({ n: 1 }),
        request(app.getHttpServer())
          .post('/commerce/race')
          .set('Idempotency-Key', 'race-1')
          .send({ n: 1 }),
      ]);

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      // Both ran — the handler is NOT exactly-once under concurrency.
      expect(raceRuns).toBe(2);
    });
  });

  /**
   * `Idempotency-Key` is chosen by the CLIENT. Keying the store on the
   * raw header value on an authenticated route means any user who
   * guesses (or simply reuses) another user's key gets that user's
   * stored response body back — a cross-tenant leak, not a replay.
   */
  describe('idempotency keys on an authenticated route', () => {
    it("does not replay one user's response to another user sending the same key", async () => {
      const before = invoicesCreated;
      const body = { amount: 100 };

      const userA = await request(app.getHttpServer())
        .post('/billing/createInvoice')
        .set('Authorization', 'Bearer user-a')
        .set('Idempotency-Key', 'invoice-1')
        .send(body)
        .expect(201);

      const userB = await request(app.getHttpServer())
        .post('/billing/createInvoice')
        .set('Authorization', 'Bearer user-b')
        .set('Idempotency-Key', 'invoice-1')
        .send(body)
        .expect(201);

      expect(userA.body.owner).toBe('user-a');
      // The whole finding: unscoped, this is user A's invoice.
      expect(userB.body.owner).toBe('user-b');
      expect(userB.body.id).not.toBe(userA.body.id);
      expect(invoicesCreated).toBe(before + 2);
    });

    it('still replays for the SAME user reusing their own key', async () => {
      const before = invoicesCreated;
      const body = { amount: 250 };

      const first = await request(app.getHttpServer())
        .post('/billing/createInvoice')
        .set('Authorization', 'Bearer user-c')
        .set('Idempotency-Key', 'invoice-2')
        .send(body)
        .expect(201);

      const second = await request(app.getHttpServer())
        .post('/billing/createInvoice')
        .set('Authorization', 'Bearer user-c')
        .set('Idempotency-Key', 'invoice-2')
        .send(body)
        .expect(201);

      expect(second.body).toEqual(first.body);
      expect(invoicesCreated).toBe(before + 1);
    });

    it('is rejected by the GUARD, not the handler, when unauthenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/billing/createInvoice')
        .set('Idempotency-Key', 'invoice-3')
        .send({ amount: 10 })
        .expect(401);

      // Pins the layer: the handler's own fail-closed branch answers
      // "missing principal", so seeing that message here would mean the
      // guard let an unauthenticated request through to the handler.
      expect(res.body.message).not.toBe('missing principal');
    });
  });

  describe('inbound webhook signature', () => {
    it('accepts a correctly signed payload', async () => {
      const payload = JSON.stringify({ event: 'order.shipped' });
      const signature = createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

      const res = await request(app.getHttpServer())
        .post('/commerce/webhook')
        .set('Content-Type', 'application/json')
        .set('x-webhook-signature', signature)
        .send(payload)
        .expect(200);

      expect(res.body).toEqual({ received: true });
      expect(webhooksAccepted).toBeGreaterThan(0);
    });

    it('rejects a wrong signature with 401', async () => {
      await request(app.getHttpServer())
        .post('/commerce/webhook')
        .set('Content-Type', 'application/json')
        .set('x-webhook-signature', 'deadbeef'.repeat(8))
        .send(JSON.stringify({ event: 'order.shipped' }))
        .expect(401);
    });

    it('rejects a missing signature with 401', async () => {
      await request(app.getHttpServer())
        .post('/commerce/webhook')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ event: 'order.shipped' }))
        .expect(401);
    });

    /**
     * A valid digest with garbage appended used to decode to exactly the
     * valid bytes and verify TRUE — `Buffer.from(x, 'hex')` stops at the
     * first invalid pair. Asserted end-to-end, not only in the unit
     * test, because this is the wire shape an attacker controls.
     */
    it('rejects a valid signature with trailing garbage', async () => {
      const payload = JSON.stringify({ event: 'order.shipped' });
      const signature = createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex');

      await request(app.getHttpServer())
        .post('/commerce/webhook')
        .set('Content-Type', 'application/json')
        .set('x-webhook-signature', `${signature}ZZZZ`)
        .send(payload)
        .expect(401);
    });
  });

  /**
   * The whole point of binding the secret in a factory: the fault
   * surfaces while Nest builds the module. Without this, the exported
   * helper's value proposition ("the app refuses to boot") was
   * documented and never exercised.
   */
  describe('webhook verifier configuration', () => {
    it('fails to boot when the bound secret is unset', async () => {
      const brokenOps = operationResource({
        path: 'broken-webhooks',
        public: true,
        providers: [
          {
            provide: WEBHOOK_VERIFIER,
            useFactory: (): WebhookSignatureVerifier =>
              // Exactly the documented shape, with the variable unset.
              createWebhookSignatureVerifier({
                secret: process.env.ROCKETS_E2E_UNSET_WEBHOOK_SECRET,
              }),
          },
        ],
        operations: (op) => ({
          webhook: op.write({
            status: 200,
            input: z.object({ event: z.string() }),
            output: z.object({ received: z.boolean() }),
            handler: WebhookHandler,
          }),
        }),
      });

      await expect(
        Test.createTestingModule({
          imports: [
            RocketsCoreModule.forRoot({
              auth: defineAuthAdapter(BearerUserAuthProvider),
              providers: [BearerUserAuthProvider],
              resources: [brokenOps],
              global: true,
            }),
          ],
        }).compile(),
      ).rejects.toThrow(/non-empty string/);
    });
  });
});
