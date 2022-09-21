import supertest from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModuleDbFixture } from './__fixtures__/app.module.fixture';
import { PasswordStorageService } from '@concepta/nestjs-password';
import { LOGIN_SUCCESS } from './__fixtures__/user/constants';

describe('AuthLocalController (e2e)', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleDbFixture],
    })
      .overrideProvider(PasswordStorageService)
      .useValue({
        validateObject: () => {
          return true;
        },
      })
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST auth/login success', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send(LOGIN_SUCCESS)
      .then((response) => {
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        expect(response.status).toBe(201);
      });
  });

  it('POST auth/login username not found ', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        username: 'no_user',
      })
      .then((response) => {
        expect(response.body.message).toBe('Unauthorized');
        expect(response.status).toBe(401);
      });
  });

  it('POST auth/login password fail ', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        password: '',
      })
      .then((response) => {
        expect(response.body.message).toBe('Unauthorized');
        expect(response.status).toBe(401);
      });
  });

  it('POST auth/login username fail ', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        username: '',
      })
      .then((response) => {
        expect(response.body.message).toBe('Unauthorized');
        expect(response.status).toBe(401);
      });
  });

  it('POST auth/login username fail ', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        username: 999,
      })
      .then((response) => {
        const errorMessage = response.body.message[0];
        // TODO: shouldn't this error msg be returned at errorMessage instead?
        expect(errorMessage.constraints.isString).toBe(
          'username must be a string',
        );
        // TODO: review this
        // expect(errorMessage).toBe('username must be a string');
        expect(response.status).toBe(400);
      });
  });

  it('POST auth/login password fail ', async () => {
    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        password: 999,
      })
      .then((response) => {
        const errorMessage = response.body.message[0];
        // TODO: shouldn't this error msg be returned at errorMessage instead?
        expect(errorMessage.constraints.isString).toBe(
          'password must be a string',
        );
        // TODO: review this
        // expect(errorMessage).toBe('username must be a string');
        expect(response.status).toBe(400);
      });
  });
});
