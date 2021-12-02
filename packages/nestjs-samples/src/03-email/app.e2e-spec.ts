import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { EmailService } from '@rockts-org/nestjs-email';

describe('AppController (e2e)', () => {
  describe('Express', () => {
    let app: INestApplication;
    let spy: jest.SpyInstance;

    beforeEach(async () => {
      spy = jest.spyOn(EmailService.prototype, 'sendEmail');

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterEach(async () => {
      jest.clearAllMocks();
      await app.close();
    });

    it('POST /notification', async () => {
      await supertest(app.getHttpServer()).post('/notification').expect(201);

      expect(spy).toHaveBeenCalledTimes(1);

      return;
    });
  });

  describe('Fastify', () => {
    let app: NestFastifyApplication;
    let spy: jest.SpyInstance;

    beforeEach(async () => {
      spy = jest.spyOn(EmailService.prototype, 'sendEmail');

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter(),
      );

      await app.init();
    });

    afterEach(async () => {
      jest.clearAllMocks();
      await app.close();
    });

    it('POST /notification', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/notification',
        })
        .then(({ statusCode }) => {
          expect(statusCode).toEqual(201);
          expect(spy).toHaveBeenCalledTimes(1);
        });
    });
  });
});
