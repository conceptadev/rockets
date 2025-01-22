import {
  AccessControlFilter,
  AccessControlGuard,
} from '@concepta/nestjs-access-control';
import { SeedingSource } from '@concepta/typeorm-seeding';
import {
  CallHandler,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import supertest from 'supertest';

import { AuthHistoryFactory } from './auth-history.factory';

import { UserInterface } from '@concepta/nestjs-common';
import { UserFactory } from '@concepta/nestjs-user/src/user.factory';
import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { LOGIN_FAIL, LOGIN_SUCCESS, USER_ID } from './__fixtures__/constants';
import { AuthHistoryEntityFixture } from './__fixtures__/entities/auth-history.entity.fixture';
import { UserEntityFixture } from './__fixtures__/entities/user-entity.fixture';

describe('AuthHistoryController (e2e)', () => {
  describe('Normal CRUD flow', () => {
    let app: INestApplication;
    let seedingSource: SeedingSource;
    let user: UserInterface;
    let accessControlGuard: AccessControlGuard;
    let accessControlFilter: AccessControlFilter;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModuleFixture],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();

      accessControlGuard = app.get(AccessControlGuard);

      jest.spyOn(accessControlGuard, 'canActivate').mockResolvedValue(true);

      accessControlFilter = app.get(AccessControlFilter);
      jest
        .spyOn(accessControlFilter, 'intercept')
        .mockImplementation((_context: ExecutionContext, next: CallHandler) => {
          return Promise.resolve(next.handle());
        });

      seedingSource = new SeedingSource({
        dataSource: app.get(getDataSourceToken()),
      });

      await seedingSource.initialize();

      const userFactory = new UserFactory({
        entity: UserEntityFixture,
        seedingSource,
      });

      user = await userFactory.create({
        id: USER_ID,
      });

      const authHistoryFactory = new AuthHistoryFactory({
        entity: AuthHistoryEntityFixture,
        seedingSource,
      });

      await authHistoryFactory.createMany(2, {
        user,
        userId: user.id,
      });
    });

    afterEach(async () => {
      jest.clearAllMocks();
      return app ? await app.close() : undefined;
    });

    it('GET /auth-history', async () => {
      await supertest(app.getHttpServer())
        .get('/auth-history?limit=10')
        .expect(200);
    });

    it('GET /auth-history/:id', async () => {
      // get a login history so we have an id
      const response = await supertest(app.getHttpServer())
        .get('/auth-history?limit=1')
        .expect(200);

      // get one using that id
      await supertest(app.getHttpServer())
        .get(`/auth-history/${response.body[0].id}`)
        .expect(200);
    });

    it('POST /auth-history', async () => {
      await supertest(app.getHttpServer())
        .post('/auth-history')
        .send({
          ipAddress: '127:0:0:1',
          authType: '2FA',
          deviceInfo: 'IOS',
          user,
          userId: user.id,
        })
        .expect(201);
    });

    it('DELETE /auth-history/:id', async () => {
      // get a login history so we have an id
      const response = await supertest(app.getHttpServer())
        .get('/auth-history?limit=1')
        .expect(200);

      // delete one using that id
      await supertest(app.getHttpServer())
        .delete(`/auth-history/${response.body[0].id}`)
        .expect(200);
    });

    describe('events', () => {
      it('should create auth history on login', async () => {
        // attempt login it should trigger the event
        await supertest(app.getHttpServer())
          .post('/auth/login')
          .send(LOGIN_SUCCESS)
          .expect(201);

        // verify auth history was created
        const response = await supertest(app.getHttpServer())
          .get('/auth-history?filter=authType||$eq||auth-local')
          .expect(200);

        expect(response.body[0]).toMatchObject({
          authType: 'auth-local',
          userId: expect.any(String),
          ipAddress: expect.any(String),
          deviceInfo: expect.any(String),
        });
      });

      it('should login trigger event and validate user agent', async () => {
        const userAgent =
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1';
        // attempt login with wrong credentials
        await supertest(app.getHttpServer())
          .post('/auth/login')
          .set('User-Agent', userAgent)
          .send(LOGIN_SUCCESS)
          .expect(201);

        const response = await supertest(app.getHttpServer())
          .get('/auth-history?filter=authType||$eq||auth-local')
          .expect(200);

        expect(response.body[0]).toMatchObject({
          authType: 'auth-local',
          userId: expect.any(String),
          ipAddress: expect.any(String),
          deviceInfo: userAgent,
        });
      });

      it('should fail login should not trigger event', async () => {
        const userAgent =
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1';
        // attempt login with wrong credentials
        await supertest(app.getHttpServer())
          .post('/auth/login')
          .set('User-Agent', userAgent)
          .send(LOGIN_FAIL)
          .expect(500);

        const response = await supertest(app.getHttpServer())
          .get('/auth-history?filter=authType||$eq||auth-local')
          .expect(200);

        expect(response.body.length).toBe(0);
      });
    });
  });
});
