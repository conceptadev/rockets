import { PasswordStorageService } from '@concepta/nestjs-password';
import { UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mock } from 'jest-mock-extended';
import { AuthLocalStrategy } from './auth-local.strategy';
import { AuthLocalSettingsInterface } from './interfaces/auth-local-settings.interface';
import { AuthLocalUserLookupServiceInterface } from './interfaces/auth-local-user-lookup-service.interface';
import { AuthLocalValidateUserServiceInterface } from './interfaces/auth-local-validate-user-service.interface';
import { AuthLocalValidateUserService } from './services/auth-local-validate-user.service';

import { UserFixture } from './__fixtures__/user/user.entity.fixture';

describe(AuthLocalStrategy, () => {
  const USERNAME = 'username';
  const PASSWORD = 'password';

  let user: UserFixture;
  let settings: AuthLocalSettingsInterface;
  let userLookUpService: AuthLocalUserLookupServiceInterface;
  let validateUserService: AuthLocalValidateUserServiceInterface;
  let passwordStorageService: PasswordStorageService;
  let authLocalStrategy: AuthLocalStrategy;

  beforeEach(async () => {
    settings = mock<Partial<AuthLocalSettingsInterface>>({
      loginDto: UserFixture,
      usernameField: USERNAME,
      passwordField: PASSWORD,
    });

    userLookUpService = mock<AuthLocalUserLookupServiceInterface>();
    passwordStorageService = mock<PasswordStorageService>();
    validateUserService = new AuthLocalValidateUserService(
      userLookUpService,
      passwordStorageService,
    );
    authLocalStrategy = new AuthLocalStrategy(settings, validateUserService);

    user = new UserFixture();
    user.id = randomUUID();
    user.active = true;
    jest.spyOn(userLookUpService, 'byUsername').mockResolvedValue(user);
  });

  it('constructor', async () => {
    settings = mock<Partial<AuthLocalSettingsInterface>>({
      loginDto: undefined,
    });
    authLocalStrategy = new AuthLocalStrategy(settings, validateUserService);
    expect(true).toBeTruthy();
  });

  describe(AuthLocalStrategy.prototype.validate, () => {
    it('should return user', async () => {
      jest
        .spyOn(passwordStorageService, 'validateObject')
        .mockResolvedValue(true);

      const result = await authLocalStrategy.validate(USERNAME, PASSWORD);
      expect(result.id).toBe(user.id);
    });

    it('should throw error on validateOrReject', async () => {
      const t = () => authLocalStrategy.validate(USERNAME, '');
      expect(t).rejects.toThrow();
    });

    it('should return no user on userLookupService.byUsername', async () => {
      jest.spyOn(userLookUpService, 'byUsername').mockResolvedValue(null);

      const t = () => authLocalStrategy.validate(USERNAME, PASSWORD);
      expect(t).rejects.toThrow(UnauthorizedException);
    });

    it('should be invalid on passwordService.validateObject', async () => {
      jest
        .spyOn(passwordStorageService, 'validateObject')
        .mockResolvedValue(false);

      const t = () => authLocalStrategy.validate(USERNAME, PASSWORD);
      expect(t).rejects.toThrow(UnauthorizedException);
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
      settings = mock<Partial<AuthLocalSettingsInterface>>({
        loginDto: undefined,
        usernameField: USERNAME,
        passwordField: PASSWORD,
      });
      authLocalStrategy = new AuthLocalStrategy(settings, validateUserService);
      const t = () => authLocalStrategy['assertSettings']();
      expect(t).toThrowError();
    });

    it('should throw error for no usernameField', async () => {
      settings = mock<Partial<AuthLocalSettingsInterface>>({
        loginDto: UserFixture,
        usernameField: undefined,
        passwordField: PASSWORD,
      });
      authLocalStrategy = new AuthLocalStrategy(settings, validateUserService);
      const t = () => authLocalStrategy['assertSettings']();
      expect(t).toThrowError();
    });

    it('should throw error for no passwordField', async () => {
      settings = mock<Partial<AuthLocalSettingsInterface>>({
        loginDto: UserFixture,
        usernameField: USERNAME,
        passwordField: undefined,
      });
      authLocalStrategy = new AuthLocalStrategy(settings, validateUserService);
      const t = () => authLocalStrategy['assertSettings']();
      expect(t).toThrowError();
    });
  });
});
