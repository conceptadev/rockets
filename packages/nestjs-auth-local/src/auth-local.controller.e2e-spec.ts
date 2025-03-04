import supertest from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModuleDbFixture } from './__fixtures__/app.module.fixture';
import { PasswordValidationService } from '@concepta/nestjs-password';
import { LOGIN_SUCCESS, USER_SUCCESS } from './__fixtures__/user/constants';
import { HttpAdapterHost } from '@nestjs/core';
import { ExceptionsFilter } from '@concepta/nestjs-exception';
import { AUTH_LOCAL_MODULE_VALIDATE_USER_SERVICE_TOKEN } from './auth-local.constants';
import { AuthLocalInvalidCredentialsException } from './exceptions/auth-local-invalid-credentials.exception';
import { UserLookupServiceFixture } from './__fixtures__/user/user-lookup.service.fixture';

describe('AuthLocalController (e2e)', () => {
  let app: INestApplication;
  let userLookupService: UserLookupServiceFixture;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleDbFixture],
    })
      .overrideProvider(PasswordValidationService)
      .useValue({
        validateObject: (passwordPlain: string) => {
          if (passwordPlain === LOGIN_SUCCESS.password) return true;
          else return false;
        },
      })
      .compile();
    app = moduleFixture.createNestApplication();

    userLookupService = app.get(UserLookupServiceFixture);
    const exceptionsFilter = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionsFilter(exceptionsFilter));

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
        expect(response.body.message).toBe(
          'The provided username or password is incorrect. Please try again.',
        );
        expect(response.status).toBe(401);
      });
  });

  it('POST auth/login username not found with custom message', async () => {
    const validateUserService = app.get(
      AUTH_LOCAL_MODULE_VALIDATE_USER_SERVICE_TOKEN,
    );

    jest
      .spyOn(validateUserService, 'validateUser')
      .mockImplementationOnce(() => {
        throw new AuthLocalInvalidCredentialsException({
          safeMessage: 'Custom invalid credentials message',
        });
      });

    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send({
        ...LOGIN_SUCCESS,
        username: 'no_user',
      })
      .then((response) => {
        expect(response.body.message).toBe(
          'Custom invalid credentials message',
        );
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
        expect(response.body.message).toBe(
          'The provided username or password is incorrect. Please try again.',
        );
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
        expect(response.body.message).toBe(
          'The provided username or password is incorrect. Please try again.',
        );
        expect(response.status).toBe(400);
      });
  });

  it('POST auth/login password fail message', async () => {
    const payload = {
      ...LOGIN_SUCCESS,
      password: 'wrong_password',
    };

    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send(payload)
      .then((response) => {
        expect(response.body.message).toBe(
          `The provided username or password is incorrect. Please try again.`,
        );
        expect(response.status).toBe(401);
      });
  });

  it('POST auth/login password fail attempt message', async () => {
    const payload = {
      ...LOGIN_SUCCESS,
      password: 'wrong_password',
    };

    jest.spyOn(userLookupService, 'byUsername').mockResolvedValue({
      ...USER_SUCCESS,
      loginAttempts: 4,
    });

    await supertest(app.getHttpServer())
      .post('/auth/login')
      .send(payload)
      .then((response) => {
        expect(response.body.message).toBe(
          'Warning: You have 6 attempts remaining before your account is locked.',
        );
        expect(response.status).toBe(401);
      });
  });
});
