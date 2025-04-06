import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import {
  AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
  AUTH_VERIFY_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_VERIFY_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from '../auth-verify.constants';

import { AuthVerifyService } from './auth-verify.service';
import { AuthVerifyNotificationService } from './auth-verify-notification.service';

import { AuthVerifySettingsInterface } from '../interfaces/auth-verify-settings.interface';
import { AuthVerifyOtpServiceInterface } from '../interfaces/auth-verify-otp.service.interface';
import { AuthVerifyUserLookupServiceInterface } from '../interfaces/auth-verify-user-lookup.service.interface';
import { AuthVerifyNotificationServiceInterface } from '../interfaces/auth-verify-notification.service.interface';
import { AuthVerifyUserMutateServiceInterface } from '../interfaces/auth-verify-user-mutate.service.interface';

import { AuthRecoveryOtpInvalidException } from '../exceptions/auth-verify-otp-invalid.exception';

import { AppModuleFixture } from '../__fixtures__/app.module.fixture';
import { OtpServiceFixture } from '../__fixtures__/otp/otp.service.fixture';
import { UserFixture } from '../__fixtures__/user/user.fixture';

describe(AuthVerifyService, () => {
  let app: INestApplication;
  let authVerifyService: AuthVerifyService;
  let notificationService: AuthVerifyNotificationServiceInterface;
  let otpService: AuthVerifyOtpServiceInterface;
  let userLookupService: AuthVerifyUserLookupServiceInterface;
  let userMutateService: AuthVerifyUserMutateServiceInterface;
  let settings: AuthVerifySettingsInterface;

  let sendVerifyEmail: jest.SpyInstance;
  let spyOtpServiceValidate: jest.SpyInstance;
  let spyUserLookupServiceByEmail: jest.SpyInstance;
  let spyUserMutateServiceUpdate: jest.SpyInstance;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authVerifyService = moduleFixture.get<AuthVerifyService>(AuthVerifyService);

    otpService =
      moduleFixture.get<AuthVerifyOtpServiceInterface>(OtpServiceFixture);

    settings = moduleFixture.get<AuthVerifySettingsInterface>(
      AUTH_VERIFY_MODULE_SETTINGS_TOKEN,
    ) as AuthVerifySettingsInterface;

    notificationService =
      moduleFixture.get<AuthVerifyNotificationServiceInterface>(
        AuthVerifyNotificationService,
      );

    userLookupService = moduleFixture.get<AuthVerifyUserLookupServiceInterface>(
      AUTH_VERIFY_MODULE_USER_LOOKUP_SERVICE_TOKEN,
    );

    userMutateService = moduleFixture.get<AuthVerifyUserMutateServiceInterface>(
      AUTH_VERIFY_MODULE_USER_MUTATE_SERVICE_TOKEN,
    );

    sendVerifyEmail = jest
      .spyOn(notificationService, 'sendVerifyEmail')
      .mockResolvedValue(undefined);

    spyOtpServiceValidate = jest.spyOn(otpService, 'validate');
    spyUserLookupServiceByEmail = jest.spyOn(userLookupService, 'byEmail');
    spyUserMutateServiceUpdate = jest.spyOn(userMutateService, 'update');
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  describe(AuthVerifyService.prototype.send, () => {
    it('should send passcode verify', async () => {
      const result = await authVerifyService.send({ email: UserFixture.email });

      expect(result).toBeUndefined();
      expect(spyUserLookupServiceByEmail).toHaveBeenCalledTimes(1);
      expect(spyUserLookupServiceByEmail).toHaveBeenCalledWith(
        UserFixture.email,
        undefined,
      );

      expect(sendVerifyEmail).toHaveBeenCalledTimes(1);
      expect(sendVerifyEmail).toHaveBeenCalledWith({
        email: UserFixture.email,
        passcode: 'GOOD_PASSCODE',
        resetTokenExp: expect.any(Date),
      });
    });
  });

  describe(AuthVerifyService.prototype.validatePasscode, () => {
    it('should call otp validator', async () => {
      await authVerifyService.validatePasscode({ passcode: 'GOOD_PASSCODE' });

      expect(spyOtpServiceValidate).toHaveBeenCalledWith(
        settings.otp.assignment,
        { category: settings.otp.category, passcode: 'GOOD_PASSCODE' },
        false,
        undefined,
      );
    });

    it('should validate good passcode', async () => {
      const otp = await authVerifyService.validatePasscode({
        passcode: 'GOOD_PASSCODE',
      });
      expect(otp).toEqual({ assignee: UserFixture });
    });

    it('should not validate bad passcode', async () => {
      const otp = await authVerifyService.validatePasscode({
        passcode: 'BAD_PASSCODE',
      });
      expect(otp).toBeNull();
    });
  });

  describe(AuthVerifyService.prototype.confirmUser, () => {
    it('should call user mutate service', async () => {
      await authVerifyService.confirmUser({ passcode: 'GOOD_PASSCODE' });

      expect(spyUserMutateServiceUpdate).toHaveBeenCalledTimes(1);
      expect(spyUserMutateServiceUpdate).toHaveBeenCalledWith(
        {
          id: UserFixture.id,
          active: true,
        },
        expect.any(Object),
      );
    });

    it('should confirm user', async () => {
      const user = await authVerifyService.confirmUser({
        passcode: 'GOOD_PASSCODE',
      });

      expect(user).toEqual(UserFixture);
    });

    it('should fail to confirm user', async () => {
      const t = async () => {
        await authVerifyService.confirmUser({
          passcode: 'FAKE_PASSCODE',
        });
      };

      expect(t).rejects.toThrow(AuthRecoveryOtpInvalidException);
    });
  });
});
