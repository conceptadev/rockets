import { FactoryProvider } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import { OtpServiceFixture } from './__fixtures__/otp/otp.service.fixture';
import { UserModelServiceFixture } from './__fixtures__/user/services/user-model.service.fixture';
import { UserPasswordServiceFixture } from './__fixtures__/user/services/user-password.service.fixture';
import {
  AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
  AuthRecoveryOtpService,
  AuthRecoveryEmailService,
  AuthRecoveryUserModelService,
  AuthRecoveryUserPasswordService,
} from './auth-recovery.constants';
import { AuthRecoveryController } from './auth-recovery.controller';
import {
  createAuthRecoveryControllers,
  createAuthRecoveryEmailServiceProvider,
  createAuthRecoveryExports,
  createAuthRecoveryNotificationServiceProvider,
  createAuthRecoveryOtpServiceProvider,
  createAuthRecoveryUserModelServiceProvider,
  createAuthRecoveryUserPasswordServiceProvider,
} from './auth-recovery.module-definition';
import { AuthRecoveryEmailServiceInterface } from './interfaces/auth-recovery-email.service.interface';
import { AuthRecoveryService } from './services/auth-recovery.service';
import { AuthRecoveryUserModelServiceInterface } from './interfaces/auth-recovery-user-model.service.interface';
import { AuthRecoveryNotificationServiceInterface } from './interfaces/auth-recovery-notification.service.interface';
import { AuthRecoveryNotificationService } from './services/auth-recovery-notification.service';
import { UserPasswordServiceInterface } from '@concepta/nestjs-user';

describe('AuthRecoveryModuleDefinition', () => {
  const mockEmailService = mock<AuthRecoveryEmailServiceInterface>();
  const mockAuthRecoveryNotification =
    mock<AuthRecoveryNotificationServiceInterface>();
  const mockAuthRecoveryOptions = {
    emailService: mockEmailService,
    otpService: new OtpServiceFixture(),
    userModelService: new UserModelServiceFixture(),
    userPasswordService: new UserPasswordServiceFixture(),
  };
  describe(createAuthRecoveryExports.name, () => {
    it('should return an array with the expected tokens', () => {
      const result = createAuthRecoveryExports();
      expect(result).toEqual([
        AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
        AuthRecoveryOtpService,
        AuthRecoveryEmailService,
        AuthRecoveryUserModelService,
        AuthRecoveryUserPasswordService,
        AuthRecoveryService,
      ]);
    });
  });

  describe(createAuthRecoveryControllers.name, () => {
    it('should return a default AuthRecoveryController', () => {
      const result = createAuthRecoveryControllers();
      expect(result).toEqual([AuthRecoveryController]);
    });

    it('should return a default AuthRecoveryController', () => {
      const result = createAuthRecoveryControllers({});
      expect(result).toEqual([AuthRecoveryController]);
    });

    it('should return a default AuthRecoveryController', () => {
      const result = createAuthRecoveryControllers({ controllers: undefined });
      expect(result).toEqual([AuthRecoveryController]);
    });

    it('should return the provided controllers', () => {
      const customController = class CustomController {};
      const result = createAuthRecoveryControllers({
        controllers: [customController],
      });
      expect(result).toEqual([customController]);
    });

    it('should return an empty array if the controllers option is an empty array', () => {
      const result = createAuthRecoveryControllers({ controllers: [] });
      expect(result).toEqual([]);
    });

    it('should return an array with AuthRecoveryController if the controllers option includes AuthRecoveryController', () => {
      const result = createAuthRecoveryControllers({
        controllers: [AuthRecoveryController],
      });
      expect(result).toEqual([AuthRecoveryController]);
    });

    it('should return an array with AuthRecoveryController and the provided controllers if the controllers option includes AuthRecoveryController and other controllers', () => {
      const customController = class CustomController {};
      const result = createAuthRecoveryControllers({
        controllers: [AuthRecoveryController, customController],
      });
      expect(result).toEqual([AuthRecoveryController, customController]);
    });
  });

  describe(createAuthRecoveryOtpServiceProvider.name, () => {
    class TestOtpService extends OtpServiceFixture {}

    const testOtpService = mock<TestOtpService>();

    it('should return a default otpService', async () => {
      const provider =
        createAuthRecoveryOtpServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBe(undefined);
    });

    it('should return an otpService from initialization', async () => {
      const provider =
        createAuthRecoveryOtpServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({
        otpService: testOtpService,
      });

      expect(useFactoryResult).toBe(testOtpService);
    });

    it('should return an overridden otpService', async () => {
      const provider = createAuthRecoveryOtpServiceProvider({
        otpService: mockAuthRecoveryOptions.otpService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBeInstanceOf(OtpServiceFixture);
    });
  });

  describe(createAuthRecoveryEmailServiceProvider.name, () => {
    it('should return a have no default', async () => {
      const provider =
        createAuthRecoveryEmailServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBe(undefined);
    });

    it('should override an emailService', async () => {
      const provider = createAuthRecoveryEmailServiceProvider({
        emailService: mockAuthRecoveryOptions.emailService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory();

      expect(useFactoryResult).toBe(mockAuthRecoveryOptions.emailService);
    });

    it('should return an emailService from initialization', async () => {
      const provider =
        createAuthRecoveryEmailServiceProvider() as FactoryProvider;

      const testMockEmailService = mock<AuthRecoveryEmailServiceInterface>();
      const useFactoryResult = await provider.useFactory({
        emailService: testMockEmailService,
      });

      expect(useFactoryResult).toBe(testMockEmailService);
    });
  });

  describe(createAuthRecoveryUserModelServiceProvider.name, () => {
    it('should return a have no default', async () => {
      const provider =
        createAuthRecoveryUserModelServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBe(undefined);
    });

    it('should override userModelService', async () => {
      const provider = createAuthRecoveryUserModelServiceProvider({
        userModelService: mockAuthRecoveryOptions.userModelService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory();

      expect(useFactoryResult).toBe(mockAuthRecoveryOptions.userModelService);
    });

    it('should return an userModelService from initialization', async () => {
      const provider =
        createAuthRecoveryUserModelServiceProvider() as FactoryProvider;

      const mockService = mock<AuthRecoveryUserModelServiceInterface>();
      const useFactoryResult = await provider.useFactory({
        userModelService: mockService,
      });

      expect(useFactoryResult).toBe(mockService);
    });
  });

  describe(createAuthRecoveryUserPasswordServiceProvider.name, () => {
    it('should return a have no default', async () => {
      const provider =
        createAuthRecoveryUserPasswordServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBe(undefined);
    });

    it('should override userPasswordService', async () => {
      const provider = createAuthRecoveryUserPasswordServiceProvider({
        userPasswordService: mockAuthRecoveryOptions.userPasswordService,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory();

      expect(useFactoryResult).toBe(
        mockAuthRecoveryOptions.userPasswordService,
      );
    });

    it('should return an userPasswordService from initialization', async () => {
      const provider =
        createAuthRecoveryUserPasswordServiceProvider() as FactoryProvider;

      const mockService = mock<UserPasswordServiceInterface>();
      const useFactoryResult = await provider.useFactory({
        userPasswordService: mockService,
      });

      expect(useFactoryResult).toBe(mockService);
    });
  });

  describe(createAuthRecoveryNotificationServiceProvider.name, () => {
    it('should return a default AuthRecoveryNotificationService', async () => {
      const provider =
        createAuthRecoveryNotificationServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({});

      expect(useFactoryResult).toBeInstanceOf(AuthRecoveryNotificationService);
    });

    it('should override notificationService', async () => {
      const provider = createAuthRecoveryNotificationServiceProvider({
        notificationService: mockAuthRecoveryNotification,
      }) as FactoryProvider;

      const useFactoryResult = await provider.useFactory();

      expect(useFactoryResult).toBe(mockAuthRecoveryNotification);
    });

    it('should return an notificationService from initialization', async () => {
      const provider =
        createAuthRecoveryNotificationServiceProvider() as FactoryProvider;

      const useFactoryResult = await provider.useFactory({
        notificationService: mockAuthRecoveryNotification,
      });

      expect(useFactoryResult).toBe(mockAuthRecoveryNotification);
    });
  });
});
