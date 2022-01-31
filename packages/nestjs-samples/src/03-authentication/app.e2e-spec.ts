import supertest from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { TestUserRepository } from './user/user.repository';
import { mock } from 'jest-mock-extended';
import { User } from '@rockts-org/nestjs-user';
import { AuthenticationResponseInterface } from '@rockts-org/nestjs-authentication';
import { UserDto } from './user/user.controller';

describe('AppController (e2e)', () => {
  describe('Authentication', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider('USER_MODULE_USER_ENTITY_REPO_TOKEN')
        .useValue(mock<User>())
        .overrideProvider('USER_MODULE_USER_CUSTOM_REPO_TOKEN')
        .useValue(new TestUserRepository())
        .compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterEach(async () => {
      jest.clearAllMocks();
      await app.close();
    });

    it('POST /auth/local', async () => {
      const sign = {
        username: 'first_user',
        password: 'AS12378',
      };

      const response: { body: AuthenticationResponseInterface } =
        await supertest(app.getHttpServer())
          .post('/auth/local')
          .send(sign)
          .expect(201);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('POST /auth/local no-auth', async () => {
      const sign = {
        username: 'first_user_2',
        password: 'AS12378',
      };

      await supertest(app.getHttpServer())
        .post('/auth/local')
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
          .post('/auth/local')
          .send(sign)
          .expect(201);
      const commonHeaders = {
        authorization: `bearer ${response.body.accessToken}`,
      };

      const getUsers: { body: UserDto[] } = await supertest(app.getHttpServer())
        .get('/custom/user/all')
        .set(commonHeaders)
        .expect(200);
      expect(getUsers.body).toBeDefined();
      expect(getUsers.body[0].username).toBe('user1');
    });

    it('GET /user Not Authorized', async () => {
      await supertest(app.getHttpServer()).get('/custom/user/all').expect(401);
    });

    it('GET /user Authorized with JWT', async () => {
      // const response: { body: AuthenticationResponseInterface } =
      //   await supertest(app.getHttpServer())
      //     .post(('/token/refresh')
      //     .send({})
      //     .expect(201);
    });
  });
});
