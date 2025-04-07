import { FactoryProvider } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import { OtpServiceFixture } from './__fixtures__/otp/otp.service.fixture';
import { UserLookupServiceFixture } from './__fixtures__/user/services/user-lookup.service.fixture';
import { UserMutateServiceFixture } from './__fixtures__/user/services/user-mutate.service.fixture';
import {
  AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
  AuthVerifyEmailService,
  AuthVerifyOtpService,
  AuthVerifyUserLookupService,
  AuthVerifyUserMutateService,
} from './auth-verify.constants';
import { AuthVerifyController } from './auth-verify.controller';
import {
  createAuthVerifyControllers,
  createAuthVerifyEmailServiceProvider,
  createAuthVerifyEntityManagerProxyProvider,
  createAuthVerifyExports,
  createAuthVerifyNotificationServiceProvider,
  createAuthVerifyOtpServiceProvider,
  createAuthVerifyUserLookupServiceProvider,
  createAuthVerifyUserMutateServiceProvider,
} from './auth-verify.module-definition';
import { AuthVerifyEmailServiceInterface } from './interfaces/auth-verify-email.service.interface';
import { AuthVerifyService } from './services/auth-verify.service';
import { AuthVerifyUserLookupServiceInterface } from './interfaces/auth-verify-user-lookup.service.interface';
import { AuthVerifyUserMutateServiceInterface } from './interfaces/auth-verify-user-mutate.service.interface';
import { AuthVerifyNotificationServiceInterface } from './interfaces/auth-verify-notification.service.interface';
import { AuthVerifyNotificationService } from './services/auth-verify-notification.service';
import { EntityManagerProxy } from '@concepta/typeorm-common';

describe('AuthVerifyModuleDefinition', () => {
  const mockEmailService = mock<AuthVerifyEmailServiceInterface>();
  const mockAuthVerifyNotification =
    mock<AuthVerifyNotificationServiceInterface>();
  const mockEntityManagerProxy = mock<EntityManagerProxy>();
  const mockAuthVerifyOptions = {
    emailService: mockEmailService,
    otpService: new OtpServiceFixture(),
    userLookupService: new UserLookupServiceFixture(),
    userMutateService: new UserMutateServiceFixture(),
  };
  describe(createAuthVerifyExports.name, () => {
    it('should return an array with the expected tokens', () => {
      const result = createAuthVerifyExports();
      expect(result).toEqual([
        AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
        AuthVerifyOtpService,
        AuthVerifyEmailService,
        AuthVerifyUserLookupService,
        AuthVerifyUserMutateService,
        AuthVerifyService,
      ]);
    });
  });

  describe(createAuthVerifyControllers.name, () => {
    it('should return a default AuthVerifyController', () => {
      const result = createAuthVerifyControllers();
      expect(result).toEqual([AuthVerifyController]);
    });

    it('should return a default AuthVerifyController', () => {
      const result = createAuthVerifyControllers({});
      expect(result).toEqual([AuthVerifyController]);
    });

    it('should return a default AuthVerifyController', () => {
      const result = createAuthVerifyControllers({ controllers: undefined });
      expect(result).toEqual([AuthVerifyController]);
    });

    it('should return the provided controllers', () => {
      const customController = class CustomController {};
      const result = createAuthVerifyControllers({
        controllers: [customController],
      });
      expect(result).toEqual([customController]);
    });

    it('should return an empty array if the controllers option is an empty array', () => {
      const result = createAuthVerifyControllers({ controllers: [] });
      expect(result).toEqual([]);
    });

    it('should return an array with AuthVerifyController if the controllers option includes AuthVerifyController', () => {
      const result = createAuthVerifyControllers({
        controllers: [AuthVerifyController],
      });
      expect(result).toEqual([AuthVerifyController]);
    });

    it('should return an array with AuthVerifyController and the provided controllers if the controllers option includes AuthVerifyController and other controllers', () => {
      const customController = class CustomController {};
      const result = createAuthVerifyControllers({
        controllers: [AuthVerifyController, customController],
      });
      expect(result).toEqual([AuthVerifyController, customController]);
    });
  });

  describe(createAuthVerifyOtpServiceProvider.name, () => {
    class TestOtpService extends OtpServiceFixture {}

    const testOtpService = mock<TestOtpService>();

    it('should return a default otpService', async () => {
      const provider = createAuthVerifyOtpServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBe(undefined);
    });

    it('should return an otpService from initialization', async () => {
      const provider = createAuthVerifyOtpServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({
        otpService: testOtpService,
      });

      expect(useFactoryResult).toBe(testOtpService);
    });

    it('should return an overridden otpService', async () => {
      const provider = createAuthVerifyOtpServiceProvider({
        otpService: mockAuthVerifyOptions.otpService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBeInstanceOf(OtpServiceFixture);
    });
  });

  describe(createAuthVerifyEmailServiceProvider.name, () => {
    it('should return a have no default', async () => {
      const provider =
        createAuthVerifyEmailServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBe(undefined);
    });

    it('should override an emailService', async () => {
      const provider = createAuthVerifyEmailServiceProvider({
        emailService: mockAuthVerifyOptions.emailService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory();

      expect(useFactoryResult).toBe(mockAuthVerifyOptions.emailService);
    });

    it('should return an emailService from initialization', async () => {
      const provider =
        createAuthVerifyEmailServiceProvider() as FactoryProvider;

      const testMockEmailService = mock<AuthVerifyEmailServiceInterface>();
      const useFactoryResult = await provider.useFactory({
        emailService: testMockEmailService,
      });

      expect(useFactoryResult).toBe(testMockEmailService);
    });
  });

  describe(createAuthVerifyUserLookupServiceProvider.name, () => {
    it('should return a have no default', async () => {
      const provider =
        createAuthVerifyUserLookupServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBe(undefined);
    });

    it('should override userLookupService', async () => {
      const provider = createAuthVerifyUserLookupServiceProvider({
        userLookupService: mockAuthVerifyOptions.userLookupService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory();

      expect(useFactoryResult).toBe(mockAuthVerifyOptions.userLookupService);
    });

    it('should return an userLookupService from initialization', async () => {
      const provider =
        createAuthVerifyUserLookupServiceProvider() as FactoryProvider;

      const mockService = mock<AuthVerifyUserLookupServiceInterface>();
      const useFactoryResult = await provider.useFactory({
        userLookupService: mockService,
      });

      expect(useFactoryResult).toBe(mockService);
    });
  });

  describe(createAuthVerifyUserMutateServiceProvider.name, () => {
    it('should return a have no default', async () => {
      const provider =
        createAuthVerifyUserMutateServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBe(undefined);
    });

    it('should override userMutateService', async () => {
      const provider = createAuthVerifyUserMutateServiceProvider({
        userMutateService: mockAuthVerifyOptions.userMutateService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory();

      expect(useFactoryResult).toBe(mockAuthVerifyOptions.userMutateService);
    });

    it('should return an userMutateService from initialization', async () => {
      const provider =
        createAuthVerifyUserMutateServiceProvider() as FactoryProvider;

      const mockService = mock<AuthVerifyUserMutateServiceInterface>();
      const useFactoryResult = await provider.useFactory({
        userMutateService: mockService,
      });

      expect(useFactoryResult).toBe(mockService);
    });
  });

  describe(createAuthVerifyNotificationServiceProvider.name, () => {
    it('should return a default AuthVerifyNotificationService', async () => {
      const provider =
        createAuthVerifyNotificationServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBeInstanceOf(AuthVerifyNotificationService);
    });

    it('should override notificationService', async () => {
      const provider = createAuthVerifyNotificationServiceProvider({
        notificationService: mockAuthVerifyNotification,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory();

      expect(useFactoryResult).toBe(mockAuthVerifyNotification);
    });

    it('should return an notificationService from initialization', async () => {
      const provider =
        createAuthVerifyNotificationServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({
        notificationService: mockAuthVerifyNotification,
      });

      expect(useFactoryResult).toBe(mockAuthVerifyNotification);
    });
  });
  describe(createAuthVerifyEntityManagerProxyProvider.name, () => {
    it('should return a default AuthVerifyNotificationService', async () => {
      const provider =
        createAuthVerifyEntityManagerProxyProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBeInstanceOf(EntityManagerProxy);
    });

    it('should override notificationService', async () => {
      const provider = createAuthVerifyEntityManagerProxyProvider({
        entityManagerProxy: mockEntityManagerProxy,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory();

      expect(useFactoryResult).toBe(mockEntityManagerProxy);
    });

    it('should return an notificationService from initialization', async () => {
      const provider =
        createAuthVerifyEntityManagerProxyProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({
        entityManagerProxy: mockEntityManagerProxy,
      });

      expect(useFactoryResult).toBe(mockEntityManagerProxy);
    });
  });
});
