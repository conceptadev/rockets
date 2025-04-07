import supertest from 'supertest';
import { mock } from 'jest-mock-extended';

import { INestApplication, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationResponseInterface } from '@concepta/nestjs-common';
import { UserCrudService } from '@concepta/nestjs-user';
import { ExceptionsFilter } from '@concepta/nestjs-common';

import { AppModule } from './app.module';
import { UserEntity } from './user/user.entity';
import { UserDto } from './user/user.controller';
import { HttpAdapterHost } from '@nestjs/core';
import { RepositoryInterface } from '@concepta/typeorm-common';

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

describe('AppController (e2e)', () => {
  describe('Authentication', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider('USER_MODULE_USER_ENTITY_REPO_TOKEN')
        .useValue(mock<UserEntity>())
        .overrideProvider('USER_MODULE_USER_CUSTOM_REPO_TOKEN')
        .useValue(mock<RepositoryInterface<UserEntity>>())
        .overrideProvider(UserCrudService)
        .useValue({})
        .compile();

      app = moduleFixture.createNestApplication();
      const exceptionsFilter = app.get(HttpAdapterHost);
      app.useGlobalFilters(new ExceptionsFilter(exceptionsFilter));

      await app.init();
    });

    afterEach(async () => {
      jest.clearAllMocks();
      await app.close();
    });

    it('POST /auth/login', async () => {
      const sign = {
        username: 'first_user',
        password: 'AS12378',
      };

      const response: { body: AuthenticationResponseInterface } =
        await supertest(app.getHttpServer())
          .post('/auth/login')
          .send(sign)
          .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('POST /auth/login no-auth', async () => {
      const sign = {
        username: 'first_user_2',
        password: 'AS12378',
      };

      await supertest(app.getHttpServer())
        .post('/auth/login')
        .send(sign)
        .expect(401);

      return;
    });

    it('GET /user', async () => {
      const sign = {
        username: 'first_user',
        password: 'AS12378',
      };

      const response: { body: AuthenticationResponseInterface } =
        await supertest(app.getHttpServer())
          .post('/auth/login')
          .send(sign)
          .expect(201);

      const getUsers: { body: UserDto[] } = await supertest(app.getHttpServer())
        .get('/custom/user/all')
        .set('Authorization', `bearer ${response.body.accessToken}`)
        .expect(200);

      expect(getUsers.body).toBeDefined();
      expect(getUsers.body[0].username).toBe('user1');
    });

    it('GET /user Not Authorized', async () => {
      await supertest(app.getHttpServer()).get('/custom/user/all').expect(401);
    });
  });

  describe('Authentication Refresh', () => {
    let app: INestApplication;
    let globalAccessToken: string;
    let globalRefreshToken: string;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider(UserCrudService)
        .useValue({})
        .compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      const sign = {
        username: 'first_user',
        password: 'AS12378',
      };

      const response: { body: AuthenticationResponseInterface } =
        await supertest(app.getHttpServer())
          .post('/auth/login')
          .send(sign)
          .expect(201);

      jest.spyOn(Logger.prototype, 'log').mockImplementation(() => null);
      jest.spyOn(Logger.prototype, 'error').mockImplementation(() => null);

      globalAccessToken = response.body.accessToken;
      globalRefreshToken = response.body.refreshToken;
    });

    afterEach(async () => {
      jest.clearAllMocks();
      await app.close();
    });

    it('GET /refresh correct token', async () => {
      await sleep(1000);

      // call to refresh token
      const responseTokenRefresh: { body: AuthenticationResponseInterface } =
        await supertest(app.getHttpServer())
          .post('/token/refresh')
          .send({
            refreshToken: globalRefreshToken,
          })
          .expect(201);

      expect(responseTokenRefresh.body.accessToken).toBeDefined();

      // tokens needs to be different
      expect(
        responseTokenRefresh.body.accessToken != globalAccessToken,
      ).toBeTruthy();
    });

    it('GET /refresh with invalid token', async () => {
      await sleep(1000);

      await supertest(app.getHttpServer())
        .post('/token/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(500);
    });

    it('GET /refresh with token as null', async () => {
      await sleep(1000);

      await supertest(app.getHttpServer())
        .post('/token/refresh')
        .send({
          refreshToken: null,
        })
        .expect(401);
    });

    it('GET /refresh without token', async () => {
      await sleep(1000);

      // call to refresh token
      await supertest(app.getHttpServer())
        .post('/token/refresh')
        .send()
        .expect(401);
    });

    it('GET /refresh token Expired', async () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjQ0NDQ0NDEwLCJleHAiOjE2NDQ0NDQ0MTF9.ST7bECqz6CDFrgJTPyXGBjMv3wUOJj7swHM12xAfSWU';
      await sleep(1000);

      // call to refresh token
      await supertest(app.getHttpServer())
        .post('/token/refresh')
        .send({
          refreshToken: expiredToken,
        })
        .expect(500);
    });

    it('GET /refresh token with wrong secret', async () => {
      const tokenForWrongSecret =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjQ0NDQ0NTM4LCJleHAiOjE2NDQ0NDgxMzh9.wNJJGie8pn3nvtBJ7Jk5EThb0hwcArMVLExjEct6alo';

      await sleep(1000);

      // call to refresh token
      await supertest(app.getHttpServer())
        .post('/token/refresh')
        .send({
          refreshToken: tokenForWrongSecret,
        })
        .expect(500);
    });
  });
});
