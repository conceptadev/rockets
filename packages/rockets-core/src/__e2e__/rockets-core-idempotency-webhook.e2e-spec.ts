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
} from '../domain/interfaces/auth-adapter.interface';
import {
  IDEMPOTENCY_STORE_TOKEN,
  type IdempotencyStoreInterface,
} from '../domain/interfaces/idempotency.interface';
import { InMemoryIdempotencyStore } from '../infrastructure/idempotency/in-memory-idempotency-store.service';
import { hashIdempotentRequest } from '../infrastructure/idempotency/hash-idempotent-request';
import { verifyWebhookSignature } from '../infrastructure/webhooks/verify-webhook-signature';

@Injectable()
class OpenAuthProvider implements AuthAdapterInterface {
  async authenticate(): Promise<AuthAttemptResult> {
    return { matched: true, user: { id: 'u1', sub: 'u1' } };
  }
}

function firstHeaderValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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
        // Compatibility cast: the store's `body` is `unknown` by
        // design (it holds ANY operation's output), but this handler
        // is the only writer for keys under this operation, so it is
        // always the `Order` shape this same handler stored.
        return existing.body as Order;
      }
    }

    ordersCreated += 1;
    const order = { id: randomUUID(), sku: ctx.input.sku, qty: ctx.input.qty };

    if (idempotencyKey !== undefined) {
      await this.store.set(
        idempotencyKey,
        { status: 201, body: order, requestHash },
        10 * 60_000,
      );
    }
    return order;
  }
}

const WEBHOOK_SECRET = 'whsec_e2e_test';
let webhooksAccepted = 0;

/**
 * Reads the raw bytes off `ctx.request.raw` — populated by Nest's own
 * `rawBody: true` app option (`app.rawBody` on the native request), not
 * anything this package adds. The parsed/re-serialized body would not
 * byte-match what the provider signed.
 */
@Injectable()
class WebhookHandler {
  handle(ctx: OperationContext<{ event: string }>): { received: boolean } {
    const raw = ctx.request.raw as { rawBody?: Buffer };
    const signature = firstHeaderValue(
      ctx.request.headers['x-webhook-signature'],
    );
    if (signature === undefined || raw.rawBody === undefined) {
      throw new UnauthorizedException('missing signature');
    }
    const valid = verifyWebhookSignature({
      payload: raw.rawBody,
      signature,
      secret: WEBHOOK_SECRET,
    });
    if (!valid) {
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
  }),
});

describe('idempotency keys + inbound webhooks (e2e, issue #59)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(OpenAuthProvider),
          providers: [OpenAuthProvider],
          resources: [ops],
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
  });
});
