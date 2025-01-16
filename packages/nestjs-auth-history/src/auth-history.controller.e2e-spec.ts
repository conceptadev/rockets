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

      // authJwtGuard = app.get(AuthJwtGuard);
      // jest.spyOn(authJwtGuard, 'canActivate').mockResolvedValue(true);

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

      user = await userFactory.create();

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
  });
});
