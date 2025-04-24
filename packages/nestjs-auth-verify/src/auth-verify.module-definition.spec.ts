import { FactoryProvider } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import { OtpServiceFixture } from './__fixtures__/otp/otp.service.fixture';
import { UserModelServiceFixture } from './__fixtures__/user/services/user-model.service.fixture';
import {
  AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
  AuthVerifyEmailService,
  AuthVerifyOtpService,
  AuthVerifyUserModelService,
} from './auth-verify.constants';
import { AuthVerifyController } from './auth-verify.controller';
import {
  createAuthVerifyControllers,
  createAuthVerifyEmailServiceProvider,
  createAuthVerifyExports,
  createAuthVerifyNotificationServiceProvider,
  createAuthVerifyOtpServiceProvider,
  createAuthVerifyUserModelServiceProvider,
} from './auth-verify.module-definition';
import { AuthVerifyEmailServiceInterface } from './interfaces/auth-verify-email.service.interface';
import { AuthVerifyService } from './services/auth-verify.service';
import { AuthVerifyUserModelServiceInterface } from './interfaces/auth-verify-user-model.service.interface';
import { AuthVerifyNotificationServiceInterface } from './interfaces/auth-verify-notification.service.interface';
import { AuthVerifyNotificationService } from './services/auth-verify-notification.service';

describe('AuthVerifyModuleDefinition', () => {
  const mockEmailService = mock<AuthVerifyEmailServiceInterface>();
  const mockAuthVerifyNotification =
    mock<AuthVerifyNotificationServiceInterface>();
  const mockAuthVerifyOptions = {
    emailService: mockEmailService,
    otpService: new OtpServiceFixture(),
    userModelService: new UserModelServiceFixture(),
  };
  describe(createAuthVerifyExports.name, () => {
    it('should return an array with the expected tokens', () => {
      const result = createAuthVerifyExports();
      expect(result).toEqual([
        AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
        AuthVerifyOtpService,
        AuthVerifyEmailService,
        AuthVerifyUserModelService,
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

  describe(createAuthVerifyUserModelServiceProvider.name, () => {
    it('should return a have no default', async () => {
      const provider =
        createAuthVerifyUserModelServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBe(undefined);
    });

    it('should override userModelService', async () => {
      const provider = createAuthVerifyUserModelServiceProvider({
        userModelService: mockAuthVerifyOptions.userModelService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory();

      expect(useFactoryResult).toBe(mockAuthVerifyOptions.userModelService);
    });

    it('should return an userModelService from initialization', async () => {
      const provider =
        createAuthVerifyUserModelServiceProvider() as FactoryProvider;

      const mockService = mock<AuthVerifyUserModelServiceInterface>();
      const useFactoryResult = await provider.useFactory({
        userModelService: mockService,
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
});
