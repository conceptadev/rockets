/**
 * Real-app proof for the ternary `public | internal | session` route
 * policy (issue #58): `@AuthSession()` + `CsrfGuard` protect a
 * session-cookie route's state-changing requests; an "internal"
 * (undecorated) route authenticated the SAME way is unaffected — the
 * only thing that changes CSRF enforcement is the decorator, not which
 * adapter matched.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Injectable, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { z } from 'zod';
import request from 'supertest';

import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import { extractCookie } from '../infrastructure/auth/parse-cookies';
import { generateCsrfToken } from '../infrastructure/auth/csrf-token';
import { RocketsCoreModule } from '../rockets-core.module';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import {
  CsrfGuard,
  type CsrfGuardOptions,
} from '../infrastructure/guards/csrf.guard';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { operationResource } from '../zod/zod-operation-resource';
import { AuthSession } from '../decorators/auth-session.decorator';
import { CSRF_GUARD_OPTIONS_TOKEN } from '../rockets-core.constants';

// 32+ chars: CsrfGuard refuses to boot below MIN_CSRF_SECRET_LENGTH.
const CSRF_SECRET = 'e2e-csrf-secret-0123456789abcdef0123456789';
const SESSION_COOKIE_NAME = '__session';

/**
 * Trivial session store: cookie value IS the session id, and any
 * non-empty session id maps to one fixed user — the point under test is
 * CSRF enforcement, not session-store design.
 */
@Injectable()
class SessionCookieAuthAdapter implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const session = extractCookie(request, SESSION_COOKIE_NAME);
    if (session === null) return { matched: false };
    return { matched: true, user: { id: 'u1', sub: 'u1' } };
  }
}

/**
 * A FUNCTION, not a shared constant: this file boots two independent
 * apps and each must own its own generated controller class rather than
 * two module graphs decorating one.
 */
const buildOps = () =>
  operationResource({
    path: 'profile',
    operations: (op) => ({
      // "session" leg — CSRF applies.
      update: op.write({
        status: 200,
        decorators: [AuthSession()],
        input: z.object({ name: z.string() }),
        output: z.object({ name: z.string() }),
        handler: (ctx) => ({ name: ctx.input.name }),
      }),
      read: op.read({
        status: 200,
        decorators: [AuthSession()],
        output: z.object({ ok: z.boolean() }),
        handler: () => ({ ok: true }),
      }),
      // "internal" leg — no @AuthSession(), same adapter still
      // authenticates it (AuthServerGuard doesn't look at the
      // decorator), but CsrfGuard no-ops here.
      internalUpdate: op.write({
        status: 200,
        input: z.object({ name: z.string() }),
        output: z.object({ name: z.string() }),
        handler: (ctx) => ({ name: ctx.input.name }),
      }),
    }),
  });

describe('session-cookie route policy + CsrfGuard (e2e, issue #58)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const csrfOptions: CsrfGuardOptions = {
      secret: CSRF_SECRET,
      sessionCookieName: SESSION_COOKIE_NAME,
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SessionCookieAuthAdapter),
          providers: [SessionCookieAuthAdapter],
          resources: [buildOps()],
          global: true,
        }),
      ],
      providers: [
        { provide: APP_GUARD, useClass: AuthServerGuard },
        { provide: APP_GUARD, useClass: CsrfGuard },
        { provide: CSRF_GUARD_OPTIONS_TOKEN, useValue: csrfOptions },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('rejects a session-route write with no session cookie at all (AuthServerGuard, not CsrfGuard)', async () => {
    await request(app.getHttpServer())
      .post('/profile/update')
      .send({ name: 'x' })
      .expect(401);
  });

  it('rejects a session-route write with a session cookie but no CSRF token', async () => {
    await request(app.getHttpServer())
      .post('/profile/update')
      .set('Cookie', `${SESSION_COOKIE_NAME}=sess-1`)
      .send({ name: 'x' })
      .expect(403);
  });

  it('rejects a session-route write with the WRONG CSRF token', async () => {
    await request(app.getHttpServer())
      .post('/profile/update')
      .set('Cookie', `${SESSION_COOKIE_NAME}=sess-1`)
      .set('x-csrf-token', 'wrong-token')
      .send({ name: 'x' })
      .expect(403);
  });

  it('accepts a session-route write with a valid CSRF token', async () => {
    const token = generateCsrfToken('sess-1', CSRF_SECRET);

    const res = await request(app.getHttpServer())
      .post('/profile/update')
      .set('Cookie', `${SESSION_COOKIE_NAME}=sess-1`)
      .set('x-csrf-token', token)
      .send({ name: 'Jane' })
      .expect(200);

    expect(res.body).toEqual({ name: 'Jane' });
  });

  it('a CSRF token minted for a DIFFERENT session cookie is rejected', async () => {
    const token = generateCsrfToken('sess-OTHER', CSRF_SECRET);

    await request(app.getHttpServer())
      .post('/profile/update')
      .set('Cookie', `${SESSION_COOKIE_NAME}=sess-1`)
      .set('x-csrf-token', token)
      .send({ name: 'x' })
      .expect(403);
  });

  it('a GET on a session route needs no CSRF token — safe methods are exempt', async () => {
    const res = await request(app.getHttpServer())
      .get('/profile/read')
      .set('Cookie', `${SESSION_COOKIE_NAME}=sess-1`)
      .expect(200);

    expect(res.body).toEqual({ ok: true });
  });

  it('an "internal" (undecorated) write authenticated the SAME way needs no CSRF token', async () => {
    const res = await request(app.getHttpServer())
      .post('/profile/internalUpdate')
      .set('Cookie', `${SESSION_COOKIE_NAME}=sess-1`)
      .send({ name: 'Bearer-style' })
      .expect(200);

    expect(res.body).toEqual({ name: 'Bearer-style' });
  });

  // A valid token with garbage appended used to VERIFY: Buffer.from(hex)
  // truncates at the first non-hex character instead of throwing, so the
  // decoded bytes matched exactly. Proven end to end because the whole
  // point is that the guard, not just the helper, rejects it.
  it('rejects a valid CSRF token with garbage appended', async () => {
    const token = generateCsrfToken('sess-1', CSRF_SECRET);

    await request(app.getHttpServer())
      .post('/profile/update')
      .set('Cookie', `${SESSION_COOKIE_NAME}=sess-1`)
      .set('x-csrf-token', `${token}-appended-garbage`)
      .send({ name: 'x' })
      .expect(403);
  });

  // Duplicate `__session` cookies resolve FIRST-wins, like the `cookie`
  // npm package. The token is minted for the FIRST value, so it must be
  // accepted; under the old last-wins parser the guard read `sess-EVIL`,
  // the token failed to match, and this request 403'd — meaning the
  // guard and every other cookie reader disagreed about the session.
  it('reads the FIRST of two duplicate session cookies, like the ecosystem', async () => {
    const token = generateCsrfToken('sess-1', CSRF_SECRET);

    const res = await request(app.getHttpServer())
      .post('/profile/update')
      .set(
        'Cookie',
        `${SESSION_COOKIE_NAME}=sess-1; ${SESSION_COOKIE_NAME}=sess-EVIL`,
      )
      .set('x-csrf-token', token)
      .send({ name: 'Jane' })
      .expect(200);

    expect(res.body).toEqual({ name: 'Jane' });
  });
});

/**
 * `headerName` is compared case-insensitively. Node lower-cases every
 * inbound header name, so a guard reading `headers[headerName]` verbatim
 * with the extremely common `'X-CSRF-Token'` convention found nothing
 * and rejected EVERY state-changing session request — a self-inflicted
 * outage that fails closed and so never looks like a security bug.
 *
 * This is a real app over supertest ON PURPOSE: a hand-built headers
 * object can be given any casing the test wants, which is exactly how
 * the original suite missed this.
 */
describe('CsrfGuard with a mixed-case headerName (e2e, issue #58)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const csrfOptions: CsrfGuardOptions = {
      secret: CSRF_SECRET,
      sessionCookieName: SESSION_COOKIE_NAME,
      headerName: 'X-CSRF-Token',
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SessionCookieAuthAdapter),
          providers: [SessionCookieAuthAdapter],
          resources: [buildOps()],
          global: true,
        }),
      ],
      providers: [
        { provide: APP_GUARD, useClass: AuthServerGuard },
        { provide: APP_GUARD, useClass: CsrfGuard },
        { provide: CSRF_GUARD_OPTIONS_TOKEN, useValue: csrfOptions },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('accepts a valid token sent with the configured mixed-case header', async () => {
    const token = generateCsrfToken('sess-1', CSRF_SECRET);

    const res = await request(app.getHttpServer())
      .post('/profile/update')
      .set('Cookie', `${SESSION_COOKIE_NAME}=sess-1`)
      .set('X-CSRF-Token', token)
      .send({ name: 'Jane' })
      .expect(200);

    expect(res.body).toEqual({ name: 'Jane' });
  });

  it('accepts the same token sent with the header in lower case', async () => {
    const token = generateCsrfToken('sess-1', CSRF_SECRET);

    await request(app.getHttpServer())
      .post('/profile/update')
      .set('Cookie', `${SESSION_COOKIE_NAME}=sess-1`)
      .set('x-csrf-token', token)
      .send({ name: 'Jane' })
      .expect(200);
  });

  it('still rejects a request that omits the token entirely', async () => {
    await request(app.getHttpServer())
      .post('/profile/update')
      .set('Cookie', `${SESSION_COOKIE_NAME}=sess-1`)
      .send({ name: 'x' })
      .expect(403);
  });
});
