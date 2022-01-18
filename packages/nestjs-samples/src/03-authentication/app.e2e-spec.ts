import supertest from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { TestUserRepository } from './user/user.repository';
import { mock } from 'jest-mock-extended';
import { User } from '@rockts-org/nestjs-user';
import { AuthenticationResponseInterface } from '@rockts-org/nestjs-authentication';

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
  });
});
