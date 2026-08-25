import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  INestApplication,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { Observable } from 'rxjs';
import { z } from 'zod';
import request from 'supertest';

import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import { extractBearerToken } from '../infrastructure/auth/extract-bearer-token';
import { RocketsCoreModule } from '../rockets-core.module';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { operationResource } from '../zod/zod-operation-resource';

/**
 * SSE support for `operationResource` (issue #52, v1 — Range/partial
 * content is a follow-up). One shared `responseMode` seam
 * (`build-operation-controller.ts`) branches the generated method onto
 * Nest's native `@Sse()` instead of `@Get()` — everything upstream of
 * that (guards, ACL, input validation) is the SAME pipeline every other
 * operation goes through, proven below by the 401 test running BEFORE
 * any stream bytes are written.
 */
@Injectable()
class SimpleAuthProvider implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(request);
    if (token === null) return { matched: false };
    if (token === 'ok') {
      return { matched: true, user: { id: 'u1', sub: 'u1' } };
    }
    return { matched: true, error: new UnauthorizedException() };
  }
}

/**
 * Extracts the JSON payload of each `data:` line from a raw SSE body.
 * Ids are auto-assigned by Nest's `SseStream` when a message omits one
 * (`writeMessage` increments `lastEventId`) — asserting on them would
 * pin an incidental framing detail, not the behavior this test cares
 * about.
 */
function ssePayloads(body: string): unknown[] {
  return [...body.matchAll(/^data: (.+)$/gm)].map(([, json]) =>
    JSON.parse(json as string),
  );
}

function ticks(count: number): Observable<MessageEvent> {
  return new Observable<MessageEvent>((subscriber) => {
    for (let seq = 1; seq <= count; seq++) {
      subscriber.next({ data: { seq } });
    }
    subscriber.complete();
  });
}

const sseOps = operationResource({
  path: 'sse',
  operations: (op) => ({
    publicTicks: op.sse({
      path: 'public',
      public: true,
      handler: () => ticks(3),
    }),
    securedTicks: op.sse({
      path: 'secured',
      handler: () => ticks(2),
    }),
    filteredTicks: op.sse({
      path: 'filtered',
      public: true,
      input: z.object({ count: z.coerce.number().int().min(0).max(5) }),
      handler: (ctx) => ticks(ctx.input.count),
    }),
  }),
});

describe('operationResource SSE (e2e, issue #52)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SimpleAuthProvider),
          providers: [SimpleAuthProvider],
          resources: [sseOps],
          global: true,
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('streams events over a public SSE route', async () => {
    const res = await request(app.getHttpServer())
      .get('/sse/public')
      .expect(200);

    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(ssePayloads(res.text)).toEqual([{ seq: 1 }, { seq: 2 }, { seq: 3 }]);
  });

  it('rejects an unauthenticated request before any stream bytes are sent', async () => {
    const res = await request(app.getHttpServer())
      .get('/sse/secured')
      .expect(401);

    expect(res.headers['content-type']).not.toContain('text/event-stream');
  });

  it('streams events over an authenticated SSE route once authenticated', async () => {
    const res = await request(app.getHttpServer())
      .get('/sse/secured')
      .set('Authorization', 'Bearer ok')
      .expect(200);

    expect(res.headers['content-type']).toContain('text/event-stream');
    expect(ssePayloads(res.text)).toEqual([{ seq: 1 }, { seq: 2 }]);
  });

  it('validates query input the same way a JSON operation does', async () => {
    const ok = await request(app.getHttpServer())
      .get('/sse/filtered?count=2')
      .expect(200);
    expect(ssePayloads(ok.text)).toEqual([{ seq: 1 }, { seq: 2 }]);

    await request(app.getHttpServer())
      .get('/sse/filtered?count=99')
      .expect(400);
  });
});
