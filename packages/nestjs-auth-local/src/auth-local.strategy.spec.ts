import { randomUUID } from 'crypto';
import { mock } from 'jest-mock-extended';
import { PasswordValidationService } from '@concepta/nestjs-password';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { AuthLocalStrategy } from './auth-local.strategy';
import { AuthLocalSettingsInterface } from './interfaces/auth-local-settings.interface';
import { AuthLocalUserLookupServiceInterface } from './interfaces/auth-local-user-lookup-service.interface';
import { AuthLocalValidateUserServiceInterface } from './interfaces/auth-local-validate-user-service.interface';
import { AuthLocalValidateUserService } from './services/auth-local-validate-user.service';

import { UserFixture } from './__fixtures__/user/user.entity.fixture';
import {
  AuthHistoryLoginInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { AuthLocalValidateUserInterface } from './interfaces/auth-local-validate-user.interface';
import { AuthLocalException } from './exceptions/auth-local.exception';
import { AuthLocalInvalidCredentialsException } from './exceptions/auth-local-invalid-credentials.exception';
import { AuthLocalInvalidLoginDataException } from './exceptions/auth-local-invalid-login-data.exception';
import { AuthLocalAuthenticatedEventAsync } from './events/auth-local-authenticated.event';
import { AUTH_LOCAL_AUTHENTICATION_TYPE } from './auth-local.constants';
import { EventDispatchService } from '@concepta/nestjs-event';
import { AuthLocalInvalidPasswordException } from './exceptions/auth-local-invalid-password.exception';
import { AuthLocalUserAttemptsException } from './exceptions/auth-local-user-attempts.exception';
import { AuthLocalRequestInterface } from './interfaces/auth-local-request.interface';

describe(AuthLocalStrategy.name, () => {
  const USERNAME = 'username';
  const PASSWORD = 'password';
  const authLogin: AuthHistoryLoginInterface = {
    ipAddress: '127.0.0.1',
    deviceInfo: 'IOS',
  };

  let user: UserFixture;
  let settings: AuthLocalSettingsInterface;
  let userLookUpService: AuthLocalUserLookupServiceInterface;
  let validateUserService: AuthLocalValidateUserServiceInterface;
  let passwordValidationService: PasswordValidationService;
  let authLocalStrategy: AuthLocalStrategy;
  let eventDispatchService: EventDispatchService;
  let spyOnDispatchService: jest.SpyInstance;
  const req: AuthLocalRequestInterface = {
    ip: '127.0.0.1',
    headers: {
      'user-agent': 'IOS',
    },
  };

  beforeEach(async () => {
    settings = mock<AuthLocalSettingsInterface>({
      loginDto: UserFixture,
      usernameField: USERNAME,
      passwordField: PASSWORD,
      maxAttempts: 10,
      minAttempts: 3,
    });

    userLookUpService = mock<AuthLocalUserLookupServiceInterface>();
    passwordValidationService = mock<PasswordValidationService>();

    validateUserService = new AuthLocalValidateUserService(
      userLookUpService,
      passwordValidationService,
      settings,
    );
    eventDispatchService = mock<EventDispatchService>();
    authLocalStrategy = new AuthLocalStrategy(
      settings,
      validateUserService,
      userLookUpService,
      eventDispatchService,
    );

    spyOnDispatchService = jest
      .spyOn(eventDispatchService, 'async')
      .mockResolvedValue([]);
    user = new UserFixture();
    user.id = randomUUID();
    user.active = true;
    user.loginAttempts = 4;

    jest.resetAllMocks();
    jest.spyOn(userLookUpService, 'byUsername').mockResolvedValue(user);
  });

  it('constructor', async () => {
    settings = mock<AuthLocalSettingsInterface>({
      loginDto: undefined,
      maxAttempts: 10,
      minAttempts: 3,
    });
    authLocalStrategy = new AuthLocalStrategy(
      settings,
      validateUserService,
      userLookUpService,
    );
    expect(true).toBeTruthy();
  });

  describe(AuthLocalStrategy.prototype.validate, () => {
    it('should return user', async () => {
      jest
        .spyOn(passwordValidationService, 'validateObject')
        .mockResolvedValue(true);

      const result = await authLocalStrategy.validate(req, USERNAME, PASSWORD);
      expect(result.id).toBe(user.id);
    });

    it('should return user and trigger event', async () => {
      jest
        .spyOn(passwordValidationService, 'validateObject')
        .mockResolvedValue(true);

      const result = await authLocalStrategy.validate(req, USERNAME, PASSWORD);
      expect(result.id).toBe(user.id);

      const authenticatedEventAsync = new AuthLocalAuthenticatedEventAsync({
        userInfo: {
          userId: user.id,
          authType: AUTH_LOCAL_AUTHENTICATION_TYPE,
          success: true,
          ...authLogin,
        },
      });
      expect(spyOnDispatchService).toBeCalledWith(authenticatedEventAsync);
    });

    it('should fail to validate user', async () => {
      jest
        .spyOn(validateUserService, 'validateUser')
        .mockImplementationOnce((_dto: AuthLocalValidateUserInterface) => {
          return null as unknown as Promise<ReferenceIdInterface<string>>;
        });

      const t = () => authLocalStrategy.validate(req, USERNAME, PASSWORD);
      await expect(t).rejects.toThrow(AuthLocalInvalidCredentialsException);
    });

    it('should fail to validate user and trigger event', async () => {
      jest
        .spyOn(validateUserService, 'validateUser')
        .mockImplementationOnce((_dto: AuthLocalValidateUserInterface) => {
          return null as unknown as Promise<ReferenceIdInterface<string>>;
        });

      const t = () => authLocalStrategy.validate(req, USERNAME, PASSWORD);
      await expect(t).rejects.toThrow(AuthLocalInvalidCredentialsException);

      const authenticatedEventAsync = new AuthLocalAuthenticatedEventAsync({
        userInfo: {
          userId: user.id,
          authType: AUTH_LOCAL_AUTHENTICATION_TYPE,
          failureReason: 'Unable to validate user with username: username',
          success: false,
          ...authLogin,
        },
      });
      expect(spyOnDispatchService).toBeCalledWith(authenticatedEventAsync);
    });

    it('should fail to validate user and trigger event missing attempt', async () => {
      jest
        .spyOn(passwordValidationService, 'validateObject')
        .mockResolvedValue(false);

      const t = () => authLocalStrategy.validate(req, USERNAME, PASSWORD);
      await expect(t).rejects.toThrow(AuthLocalUserAttemptsException);

      const authenticatedEventAsync = new AuthLocalAuthenticatedEventAsync({
        userInfo: {
          userId: user.id,
          authType: AUTH_LOCAL_AUTHENTICATION_TYPE,
          failureReason:
            'Warning: You have 6 attempts remaining before your account is locked.',
          success: false,
          ...authLogin,
        },
      });
      expect(spyOnDispatchService).toBeCalledWith(authenticatedEventAsync);
    });

    it('should fail to validate user and trigger event invalid password', async () => {
      jest
        .spyOn(validateUserService, 'validateUser')
        .mockImplementationOnce((_dto: AuthLocalValidateUserInterface) => {
          throw new AuthLocalInvalidPasswordException('fake_username');
        });

      const t = () => authLocalStrategy.validate(req, USERNAME, PASSWORD);
      await expect(t).rejects.toThrow(AuthLocalInvalidCredentialsException);

      const authenticatedEventAsync = new AuthLocalAuthenticatedEventAsync({
        userInfo: {
          userId: user.id,
          authType: AUTH_LOCAL_AUTHENTICATION_TYPE,
          failureReason: 'Invalid password for username: fake_username',
          success: false,
          ...authLogin,
        },
      });
      expect(spyOnDispatchService).toBeCalledWith(authenticatedEventAsync);
    });

    it('should fail to validate user with custom message', async () => {
      jest
        .spyOn(validateUserService, 'validateUser')
        .mockImplementation((_dto: AuthLocalValidateUserInterface) => {
          throw new AuthLocalInvalidCredentialsException({
            message: 'Custom message',
            safeMessage: 'Custom safe message',
          });
        });

      const t = () => authLocalStrategy.validate(req, USERNAME, PASSWORD);

      try {
        await t();
      } catch (error: unknown) {
        if (error instanceof AuthLocalInvalidCredentialsException) {
          expect(error.httpStatus).toBe(HttpStatus.UNAUTHORIZED);
          expect(error.message).toBe('Custom message');
          expect(error.safeMessage).toBe('Custom safe message');
        } else {
          throw new Error('Wrong error type');
        }
      }
    });

    it('should fail with internal server error', async () => {
      jest
        .spyOn(validateUserService, 'validateUser')
        .mockImplementation((_dto: AuthLocalValidateUserInterface) => {
          throw new Error('This is really bad');
        });

      const t = () => authLocalStrategy.validate(req, USERNAME, PASSWORD);

      try {
        await t();
      } catch (error: unknown) {
        if (error instanceof AuthLocalException) {
          expect(error?.httpStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(error?.context?.originalError?.message).toBe(
            'This is really bad',
          );
        } else {
          throw new Error('Wrong error type');
        }
      }
    });

    it('should throw error on validateOrReject', async () => {
      const t = () => authLocalStrategy.validate(req, USERNAME, '');
      await expect(t).rejects.toThrow();
    });

    it('should throw BadRequest on validateOrReject', async () => {
      const classValidator = require('class-validator');
      jest
        .spyOn(classValidator, 'validateOrReject')
        .mockRejectedValueOnce(BadRequestException);

      const t = () => authLocalStrategy.validate(req, USERNAME, PASSWORD);
      await expect(t).rejects.toThrow(AuthLocalInvalidLoginDataException);
    });

    it('should return no user on userLookupService.byUsername', async () => {
      jest.spyOn(userLookUpService, 'byUsername').mockResolvedValue(null);

      const t = () => authLocalStrategy.validate(req, USERNAME, PASSWORD);
      await expect(t).rejects.toThrow(AuthLocalInvalidCredentialsException);
    });

    it('should be invalid on passwordService.validateObject', async () => {
      jest
        .spyOn(passwordValidationService, 'validateObject')
        .mockResolvedValue(false);

      const t = () => authLocalStrategy.validate(req, USERNAME, PASSWORD);
      await expect(t).rejects.toThrow(AuthLocalInvalidCredentialsException);
    });
  });

  describe(AuthLocalStrategy.prototype['assertSettings'], () => {
    it('should return with success', async () => {
      const result = authLocalStrategy['assertSettings']();
      expect(result.loginDto).toBe(settings.loginDto);
      expect(result.usernameField).toBe(settings.usernameField);
      expect(result.passwordField).toBe(settings.passwordField);
    });

    it('should throw error for no loginDto', async () => {
      settings = mock<AuthLocalSettingsInterface>({
        loginDto: undefined,
        usernameField: USERNAME,
        passwordField: PASSWORD,
        maxAttempts: 10,
        minAttempts: 3,
      });

      authLocalStrategy = new AuthLocalStrategy(
        settings,
        validateUserService,
        userLookUpService,
      );
      const t = () => authLocalStrategy['assertSettings']();
      expect(t).toThrowError();
    });

    it('should throw error for no usernameField', async () => {
      settings = mock<AuthLocalSettingsInterface>({
        loginDto: UserFixture,
        usernameField: undefined,
        passwordField: PASSWORD,
      });
      authLocalStrategy = new AuthLocalStrategy(
        settings,
        validateUserService,
        userLookUpService,
      );
      const t = () => authLocalStrategy['assertSettings']();
      expect(t).toThrowError();
    });

    it('should throw error for no passwordField', async () => {
      settings = mock<AuthLocalSettingsInterface>({
        loginDto: UserFixture,
        usernameField: USERNAME,
        passwordField: undefined,
        maxAttempts: 10,
        minAttempts: 3,
      });
      authLocalStrategy = new AuthLocalStrategy(
        settings,
        validateUserService,
        userLookUpService,
      );
      const t = () => authLocalStrategy['assertSettings']();
      expect(t).toThrowError();
    });
  });
});
