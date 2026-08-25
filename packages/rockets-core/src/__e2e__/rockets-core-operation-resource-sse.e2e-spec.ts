import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  BadRequestException,
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

/**
 * A connection string is the shape of internal detail that must never
 * reach a client. Nest's SSE response controller writes `err.message`
 * verbatim onto a committed stream, so before the mask this string went
 * straight to an ANONYMOUS caller of a `public: true` route.
 */
const INTERNAL_SECRET = 'postgres://svc:hunter2@db.internal:5432/records';

/** One event (committing the headers), then a raw internal failure. */
function tickThenInternalError(): Observable<MessageEvent> {
  return new Observable<MessageEvent>((subscriber) => {
    subscriber.next({ data: { seq: 1 } });
    subscriber.error(new Error(`connect failed: ${INTERNAL_SECRET}`));
  });
}

/** One event, then a failure the AUTHOR chose to make client-visible. */
function tickThenClientError(): Observable<MessageEvent> {
  return new Observable<MessageEvent>((subscriber) => {
    subscriber.next({ data: { seq: 1 } });
    subscriber.error(new BadRequestException('channel closed by peer'));
  });
}

/**
 * Every SSE frame as `{ event, data }`, with `data` left as RAW text.
 * Deliberately not `ssePayloads`: an error frame's data is a bare
 * message, not JSON, and this assertion is about the exact bytes that
 * reached the client.
 */
function sseFrames(body: string): Array<{ event: string; data: string }> {
  return body
    .split('\n\n')
    .filter((frame) => frame.trim().length > 0)
    .map((frame) => {
      const lines = frame.split('\n');
      const type = lines.find((line) => line.startsWith('event: '));
      return {
        event: type === undefined ? 'message' : type.slice('event: '.length),
        data: lines
          .filter((line) => line.startsWith('data: '))
          .map((line) => line.slice('data: '.length))
          .join('\n'),
      };
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
    internalFailure: op.sse({
      path: 'internal-failure',
      public: true,
      handler: () => tickThenInternalError(),
    }),
    clientFailure: op.sse({
      path: 'client-failure',
      public: true,
      handler: () => tickThenClientError(),
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

  it('masks a mid-stream internal failure instead of writing it to the wire', async () => {
    const res = await request(app.getHttpServer())
      .get('/sse/internal-failure')
      .expect(200);

    // The whole raw body, not just the parsed frames: nothing anywhere
    // on this connection may quote the internal detail.
    expect(res.text).not.toContain(INTERNAL_SECRET);
    expect(res.text).not.toContain('hunter2');
    expect(res.text).not.toContain('connect failed');

    // The event that got through BEFORE the failure still arrives — a
    // mask on the error, not a blackout of the stream — and the failure
    // carries the same generic text a 5xx JSON response would.
    const [tick, failure] = sseFrames(res.text);
    expect(tick).toEqual({ event: 'message', data: '{"seq":1}' });
    expect(failure).toEqual({ event: 'error', data: 'Internal Server Error' });
  });

  it('keeps an author-chosen 4xx message on a mid-stream failure', async () => {
    const res = await request(app.getHttpServer())
      .get('/sse/client-failure')
      .expect(200);

    // An HttpException body is author-chosen and the exceptions filter
    // puts it on the wire at any status; the stream matches that, so the
    // mask is not a blanket blackout of every mid-stream failure.
    const [tick, failure] = sseFrames(res.text);
    expect(tick).toEqual({ event: 'message', data: '{"seq":1}' });
    expect(failure).toEqual({ event: 'error', data: 'channel closed by peer' });
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
