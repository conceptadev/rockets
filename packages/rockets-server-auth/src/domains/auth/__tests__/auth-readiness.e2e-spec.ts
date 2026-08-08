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

describe.sequential('Rockets Auth 1.0 readiness (e2e)', () => {
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

      const otp = await module
        .get(DataSource)
        .getRepository(UserOtpEntityFixture)
        .findOneByOrFail({ active: true });

      await request(app.getHttpServer())
        .post('/recovery/passcode')
        .send({ passcode: otp.passcode })
        .expect(200);

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
  });
});
