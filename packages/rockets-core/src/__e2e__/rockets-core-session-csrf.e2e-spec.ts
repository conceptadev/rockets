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

const CSRF_SECRET = 'e2e-csrf-secret';
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

const ops = operationResource({
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
    // authenticates it (AuthServerGuard doesn't look at the decorator),
    // but CsrfGuard no-ops here.
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
          resources: [ops],
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
});
