import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  Controller,
  Get,
  INestApplication,
  Module,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import {
  AUTH_ADAPTERS_TOKEN,
  AuthServerGuard,
  type AuthorizedUser,
} from '@concepta/rockets-core';

import { FirebaseAuthAdapter } from '../adapters/firebase-auth.adapter';
import { defineFirebaseAuth } from '../integration/define-firebase-auth';
import { FirebaseDecodedTokenInterface } from '../interfaces/firebase-decoded-token.interface';
import { FirebaseTokenVerifierInterface } from '../interfaces/firebase-token-verifier.interface';

class StubVerifier implements FirebaseTokenVerifierInterface {
  async verifyIdToken(token: string): Promise<FirebaseDecodedTokenInterface> {
    if (token === 'good') {
      return { uid: 'fb-user-1', sub: 'fb-user-1', email: 'u@example.com' };
    }
    throw Object.assign(new Error('bad token'), {
      code: 'authid-token-expired',
    });
  }
}

@Controller('probe')
class ProbeController {
  @Get('me')
  me(): { ok: true } {
    return { ok: true };
  }
}

@Module({
  controllers: [ProbeController],
})
class ProbeModule {}

describe('FirebaseAuthAdapter + AuthServerGuard (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const bootstrap = defineFirebaseAuth({
      verifier: StubVerifier,
    });

    const moduleRef = await Test.createTestingModule({
      imports: [bootstrap.forRoot!(), ProbeModule],
      providers: [
        {
          provide: AUTH_ADAPTERS_TOKEN,
          useFactory: (adapter: FirebaseAuthAdapter) => [adapter],
          inject: [FirebaseAuthAdapter],
        },
        { provide: APP_GUARD, useClass: AuthServerGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects requests without a Bearer token with 401', async () => {
    await request(app.getHttpServer()).get('/probe/me').expect(401);
  });

  it('authenticates a valid Firebase ID token via the adapter chain', async () => {
    const response = await request(app.getHttpServer())
      .get('/probe/me')
      .set('Authorization', 'Bearer good')
      .expect(200);

    expect(response.body).toEqual({ ok: true });

    const adapter = app.get(FirebaseAuthAdapter);
    const result = await adapter.authenticate({
      headers: { authorization: 'Bearer good' },
      query: {},
      raw: {},
    });
    expect(result).toMatchObject({ matched: true });
    if ('user' in result) {
      const user: AuthorizedUser = result.user;
      expect(user.id).toBe('fb-user-1');
      expect(user.email).toBe('u@example.com');
    }
  });

  it('maps invalid tokens to 401 UnauthorizedException from the adapter', async () => {
    await request(app.getHttpServer())
      .get('/probe/me')
      .set('Authorization', 'Bearer bad')
      .expect(401);
  });

  it('surfaces UnauthorizedException instances from the guard path', async () => {
    const adapter = app.get(FirebaseAuthAdapter);
    const result = await adapter.authenticate({
      headers: { authorization: 'Bearer bad' },
      query: {},
      raw: {},
    });
    expect(result.matched).toBe(true);
    if ('error' in result) {
      expect(result.error).toBeInstanceOf(UnauthorizedException);
    }
  });
});
