import 'reflect-metadata';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { INestApplication, Logger } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';

import { UserOtpEntityFixture } from '../../../__fixtures__/user/user-otp-entity.fixture';
import {
  applyRocketsAuthE2eAppGlobals,
  createRocketsAuthStandardE2eTestingModule,
} from '../../../__e2e__/helpers/rockets-auth-e2e-app.factory';

const originalCredentials = {
  email: 'auth-readiness@example.com',
  username: 'auth-readiness',
  active: true,
  password: 'OriginalP@ssw0rd!',
};

/**
 * Recovery dispatch is fire-and-forget (the endpoint answers before the OTP
 * row exists), so the flow test polls instead of reading immediately.
 */
async function pollUntil<T>(
  read: () => Promise<T | null>,
  what: string,
  timeoutMs = 5000,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const value = await read();
    if (value !== null) return value;
    if (Date.now() > deadline) {
      throw new Error(`Timed out after ${timeoutMs}ms waiting for ${what}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

describe('Rockets Auth 1.0 readiness (e2e)', () => {
  describe('recovery and handler ownership', () => {
    let app: INestApplication;
    let module: TestingModule;
    let registrationWarnings: string[] = [];
    const mockEmail = { sendMail: vi.fn().mockResolvedValue(undefined) };

    beforeAll(async () => {
      const warn = vi.spyOn(Logger.prototype, 'warn');

      module = await createRocketsAuthStandardE2eTestingModule({
        mockEmailService: mockEmail,
      });
      app = module.createNestApplication();
      applyRocketsAuthE2eAppGlobals(app);
      await app.init();

      registrationWarnings = warn.mock.calls
        .flatMap((args) => args)
        .map(String)
        .filter((message) => message.includes('already registered'));
      warn.mockRestore();

      await request(app.getHttpServer())
        .post('/signup')
        .send(originalCredentials)
        .expect(201);
    });

    afterAll(async () => {
      await app.close();
    });

    it('registers every CQRS handler exactly once', () => {
      expect(registrationWarnings).toEqual([]);
    });

    it('resolves the upstream DI tokens the password-port handlers depend on', () => {
      // Hand-copied strings (upstream does not export the constants) — an
      // upstream rename must fail here, not at a production boot.
      expect(module.get('USER_CREDENTIALS_REPOSITORY_TOKEN')).toBeDefined();
      expect(module.get('USER_MODULE_SETTINGS_TOKEN')).toBeDefined();
    });

    it('supports the complete account-recovery flow without disclosing unknown emails', async () => {
      await request(app.getHttpServer())
        .post('/recovery/login')
        .send({ email: originalCredentials.email })
        .expect(200);

      await request(app.getHttpServer())
        .post('/recovery/login')
        .send({ email: 'unknown@example.com' })
        .expect(200);

      await request(app.getHttpServer())
        .post('/recovery/password')
        .send({ email: originalCredentials.email })
        .expect(200);

      const otpRepository = module
        .get(DataSource)
        .getRepository(UserOtpEntityFixture);
      const otp = await pollUntil(
        () => otpRepository.findOneBy({ active: true }),
        'the recovery OTP row',
      );

      await request(app.getHttpServer())
        .post('/recovery/passcode')
        .send({ passcode: otp.passcode })
        .expect(200);

      // The v7 surface leaked the passcode in the URL. Validation is POST-only
      // now, so the old GET route must stay unmounted.
      await request(app.getHttpServer())
        .get(`/recovery/passcode/${otp.passcode}`)
        .expect(404);

      const newPassword = 'RecoveredP@ssw0rd!';
      const resetResponse = await request(app.getHttpServer())
        .patch('/recovery/password')
        .send({ passcode: otp.passcode, newPassword });
      expect(resetResponse.status, JSON.stringify(resetResponse.body)).toBe(
        200,
      );

      await request(app.getHttpServer())
        .post('/token/password')
        .send({ username: originalCredentials.username, password: newPassword })
        .expect(200);
    });
  });

  describe('request throttling', () => {
    let app: INestApplication;
    const mockEmail = { sendMail: vi.fn().mockResolvedValue(undefined) };

    beforeAll(async () => {
      const module = await createRocketsAuthStandardE2eTestingModule({
        mockEmailService: mockEmail,
      });
      app = module.createNestApplication();
      applyRocketsAuthE2eAppGlobals(app);
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    it('enforces the declared login limit', async () => {
      for (let attempt = 1; attempt <= 10; attempt += 1) {
        await request(app.getHttpServer())
          .post('/token/password')
          .send({ username: 'missing-user', password: 'wrong-password' })
          .expect(401);
      }

      await request(app.getHttpServer())
        .post('/token/password')
        .send({ username: 'missing-user', password: 'wrong-password' })
        .expect(429);
    });

    it('throttles per account, so one account cannot lock another out', async () => {
      for (let attempt = 1; attempt <= 10; attempt += 1) {
        await request(app.getHttpServer())
          .post('/token/password')
          .send({ username: 'victim-lockout', password: 'wrong-password' })
          .expect(401);
      }

      // The victim's own bucket is now exhausted — proves throttling is active.
      await request(app.getHttpServer())
        .post('/token/password')
        .send({ username: 'victim-lockout', password: 'wrong-password' })
        .expect(429);

      // Same client IP, a different account: its bucket is independent, so the
      // exhausted account cannot deny login to everyone else.
      await request(app.getHttpServer())
        .post('/token/password')
        .send({ username: 'other-account', password: 'wrong-password' })
        .expect(401);
    });
  });
});
