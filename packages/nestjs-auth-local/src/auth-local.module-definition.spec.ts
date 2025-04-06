import { IssueTokenService } from '@concepta/nestjs-authentication';
import { PasswordValidationService } from '@concepta/nestjs-password';
import { FactoryProvider } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import { UserLookupServiceFixture } from './__fixtures__/user/user-lookup.service.fixture';
import {
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
  AuthLocalIssueTokenService,
  AuthLocalPasswordValidationService,
  AuthLocalUserLookupService,
} from './auth-local.constants';
import { AuthLocalController } from './auth-local.controller';
import {
  createAuthLocalControllers,
  createAuthLocalExports,
  createAuthLocalIssueTokenServiceProvider,
  createAuthLocalPasswordValidationServiceProvider,
  createAuthLocalUserLookupServiceProvider,
  createAuthLocalValidateUserServiceProvider,
} from './auth-local.module-definition';
import { AuthLocalValidateUserService } from './services/auth-local-validate-user.service';
import { JwtIssueTokenService } from '@concepta/nestjs-jwt';

describe('Auth-local.module-definition', () => {
  describe(createAuthLocalExports.name, () => {
    it('should return an array with the expected tokens', () => {
      const result = createAuthLocalExports();
      expect(result).toEqual([
        AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
        AuthLocalUserLookupService,
        AuthLocalIssueTokenService,
        AuthLocalPasswordValidationService,
        AuthLocalValidateUserService,
      ]);
    });
  });

  describe(createAuthLocalControllers.name, () => {
    it('should return a default AuthLocalController', () => {
      const result = createAuthLocalControllers();
      expect(result).toEqual([AuthLocalController]);
    });

    it('should return a default AuthLocalController', () => {
      const result = createAuthLocalControllers({});
      expect(result).toEqual([AuthLocalController]);
    });

    it('should return a default AuthLocalController', () => {
      const result = createAuthLocalControllers({ controllers: undefined });
      expect(result).toEqual([AuthLocalController]);
    });

    it('should return the provided controllers', () => {
      const customController = class CustomController {};
      const result = createAuthLocalControllers({
        controllers: [customController],
      });
      expect(result).toEqual([customController]);
    });

    it('should return an empty array if the controllers option is an empty array', () => {
      const result = createAuthLocalControllers({ controllers: [] });
      expect(result).toEqual([]);
    });

    it('should return an array with AuthLocalController if the controllers option includes AuthLocalController', () => {
      const result = createAuthLocalControllers({
        controllers: [AuthLocalController],
      });
      expect(result).toEqual([AuthLocalController]);
    });

    it('should return an array with AuthLocalController and the provided controllers if the controllers option includes AuthLocalController and other controllers', () => {
      const customController = class CustomController {};
      const result = createAuthLocalControllers({
        controllers: [AuthLocalController, customController],
      });
      expect(result).toEqual([AuthLocalController, customController]);
    });
  });

  describe(createAuthLocalValidateUserServiceProvider.name, () => {
    class TestUserLookupService extends UserLookupServiceFixture {}
    class TestPasswordValidationService extends PasswordValidationService {}
    class TestAuthLocalValidateUserService extends AuthLocalValidateUserService {}

    const testUserLookupService = mock<TestUserLookupService>();
    const testPasswordValidationService = mock<TestPasswordValidationService>();
    const testAuthLocalValidateUserService =
      new TestAuthLocalValidateUserService(
        testUserLookupService,
        testPasswordValidationService,
      );

    it('should return a default validateUserService', async () => {
      const provider =
        createAuthLocalValidateUserServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBeInstanceOf(AuthLocalValidateUserService);
    });

    it('should return a validateUserService from initialization', async () => {
      const provider =
        createAuthLocalValidateUserServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({
        validateUserService: testAuthLocalValidateUserService,
      });

      expect(useFactoryResult).toBeInstanceOf(TestAuthLocalValidateUserService);
    });

    it('should return a override validateUserService', async () => {
      const provider = createAuthLocalValidateUserServiceProvider({
        validateUserService: testAuthLocalValidateUserService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBeInstanceOf(TestAuthLocalValidateUserService);
    });
  });

  describe(createAuthLocalIssueTokenServiceProvider.name, () => {
    class TestIssueTokenService extends IssueTokenService {}

    const jwtIssueTokenService = mock<JwtIssueTokenService>();
    const testIssueTokenService = new TestIssueTokenService(
      jwtIssueTokenService,
    );

    it('should return an issueTokenService', async () => {
      const provider =
        createAuthLocalIssueTokenServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory(
        {},
        testIssueTokenService,
      );

      expect(useFactoryResult).toBeInstanceOf(TestIssueTokenService);
    });

    it('should return an issueTokenService from initialization', async () => {
      const provider =
        createAuthLocalIssueTokenServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({
        issueTokenService: testIssueTokenService,
      });

      expect(useFactoryResult).toBeInstanceOf(TestIssueTokenService);
    });

    it('should return an overridden issueTokenService', async () => {
      const provider = createAuthLocalIssueTokenServiceProvider({
        issueTokenService: testIssueTokenService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBeInstanceOf(TestIssueTokenService);
    });
  });

  describe(createAuthLocalUserLookupServiceProvider.name, () => {
    class LookupService extends UserLookupServiceFixture {}
    class OverrideLookupService extends UserLookupServiceFixture {}

    it('should return a default userLookupService', async () => {
      const provider: FactoryProvider =
        createAuthLocalUserLookupServiceProvider({
          userLookupService: new OverrideLookupService(),
        }) as FactoryProvider;

      // useFactory is for when class was initially defined
      const useFactoryResult = await provider.useFactory({
        userLookupService: new LookupService(),
      });
      expect(useFactoryResult).toBeInstanceOf(OverrideLookupService);
    });

    it('should return a userLookupService from initialization', async () => {
      const provider: FactoryProvider =
        createAuthLocalUserLookupServiceProvider() as FactoryProvider;

      // useFactory is for when class was initially defined
      const useFactoryResult = await provider.useFactory({
        userLookupService: new LookupService(),
      });
      expect(useFactoryResult).toBeInstanceOf(LookupService);
    });
  });

  describe(createAuthLocalPasswordValidationServiceProvider.name, () => {
    class TestPasswordValidationService extends PasswordValidationService {}

    const testPasswordValidationService = new TestPasswordValidationService();

    it('should return an issueTokenService', async () => {
      const provider =
        createAuthLocalPasswordValidationServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory(
        {},
        testPasswordValidationService,
      );

      expect(useFactoryResult).toBeInstanceOf(TestPasswordValidationService);
    });

    it('should return an issueTokenService from initialization', async () => {
      const provider =
        createAuthLocalPasswordValidationServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({
        passwordValidationService: testPasswordValidationService,
      });

      expect(useFactoryResult).toBeInstanceOf(TestPasswordValidationService);
    });

    it('should return an overridden issueTokenService', async () => {
      const provider = createAuthLocalPasswordValidationServiceProvider({
        passwordValidationService: testPasswordValidationService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBeInstanceOf(TestPasswordValidationService);
    });
  });
});
