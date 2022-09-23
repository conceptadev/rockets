import { mock } from 'jest-mock-extended';
import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailModule, EmailService } from '@concepta/nestjs-email';

import {
  AUTH_RECOVERY_MODULE_EMAIL_SERVICE_TOKEN,
  AUTH_RECOVERY_MODULE_OTP_SERVICE_TOKEN,
  AUTH_RECOVERY_MODULE_SETTINGS_TOKEN,
  AUTH_RECOVERY_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_RECOVERY_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from './auth-recovery.constants';

import { AuthRecoverySettingsInterface } from './interfaces/auth-recovery-settings.interface';
import { AuthRecoveryOtpServiceInterface } from './interfaces/auth-recovery-otp.service.interface';
import { AuthRecoveryEmailServiceInterface } from './interfaces/auth-recovery-email.service.interface';
import { AuthRecoveryUserLookupServiceInterface } from './interfaces/auth-recovery-user-lookup.service.interface';
import { AuthRecoveryUserMutateServiceInterface } from './interfaces/auth-recovery-user-mutate.service.interface';
import { AuthRecoveryServiceInterface } from './interfaces/auth-recovery.service.interface';
import { AuthRecoveryController } from './auth-recovery.controller';
import { AuthRecoveryModule } from './auth-recovery.module';
import { AuthRecoveryService } from './services/auth-recovery.service';

import { UserLookupServiceFixture } from './__fixtures__/user/services/user-lookup.service.fixture';
import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';
import { OtpModuleFixture } from './__fixtures__/otp/otp.module.fixture';
import { UserMutateServiceFixture } from './__fixtures__/user/services/user-mutate.service.fixture';
import { OtpServiceFixture } from './__fixtures__/otp/otp.service.fixture';
import { MailerServiceFixture } from './__fixtures__/email/mailer.service.fixture';
import { TypeOrmModuleFixture } from './__fixtures__/typeorm.module.fixture';

describe(AuthRecoveryModule, () => {
  let testModule: TestingModule;
  let authRecoveryModule: AuthRecoveryModule;
  let otpService: AuthRecoveryOtpServiceInterface;
  let userLookupService: AuthRecoveryUserLookupServiceInterface;
  let userMutateService: AuthRecoveryUserMutateServiceInterface;
  let authRecoveryService: AuthRecoveryServiceInterface;
  let authRecoveryController: AuthRecoveryController;
  let emailService: EmailService;

  const mockEmailService = mock<AuthRecoveryEmailServiceInterface>();

  describe(AuthRecoveryModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthRecoveryModule.forRoot({
            emailService: mockEmailService,
            otpService: new OtpServiceFixture(),
            userLookupService: new UserLookupServiceFixture(),
            userMutateService: new UserMutateServiceFixture(),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(AuthRecoveryModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthRecoveryModule.register({
            emailService: mockEmailService,
            otpService: new OtpServiceFixture(),
            userLookupService: new UserLookupServiceFixture(),
            userMutateService: new UserMutateServiceFixture(),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(AuthRecoveryModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthRecoveryModule.forRootAsync({
            inject: [
              UserLookupServiceFixture,
              UserMutateServiceFixture,
              OtpServiceFixture,
              EmailService,
            ],
            useFactory: (
              userLookupService,
              userMutateService,
              otpService,
              emailService,
            ) => ({
              userLookupService,
              userMutateService,
              otpService,
              emailService,
            }),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(AuthRecoveryModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthRecoveryModule.registerAsync({
            inject: [
              UserLookupServiceFixture,
              UserMutateServiceFixture,
              OtpServiceFixture,
              EmailService,
            ],
            useFactory: (
              userLookupService,
              userMutateService,
              otpService,
              emailService,
            ) => ({
              userLookupService,
              userMutateService,
              otpService,
              emailService,
            }),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(AuthRecoveryModule.forFeature, () => {
    @Module({})
    class GlobalModule {}

    @Module({})
    class ForFeatureModule {}

    @Injectable()
    class TestService {
      constructor(
        @Inject(AUTH_RECOVERY_MODULE_SETTINGS_TOKEN)
        public settings: AuthRecoverySettingsInterface,
        @Inject(AUTH_RECOVERY_MODULE_EMAIL_SERVICE_TOKEN)
        public emailService: AuthRecoveryEmailServiceInterface,
        @Inject(AUTH_RECOVERY_MODULE_OTP_SERVICE_TOKEN)
        public otpService: AuthRecoveryOtpServiceInterface,
        @Inject(AUTH_RECOVERY_MODULE_USER_LOOKUP_SERVICE_TOKEN)
        public userLookupService: AuthRecoveryUserLookupServiceInterface,
        @Inject(AUTH_RECOVERY_MODULE_USER_MUTATE_SERVICE_TOKEN)
        public userMutateService: AuthRecoveryUserMutateServiceInterface,
      ) {}
    }

    let testService: TestService;
    const ffEmailService = mock<AuthRecoveryEmailServiceInterface>();
    const ffOtpService = new OtpServiceFixture();
    const ffUserLookupService = new UserLookupServiceFixture();
    const ffUserMutateService = new UserMutateServiceFixture();

    beforeEach(async () => {
      const globalModule = testModuleFactory([
        AuthRecoveryModule.forRootAsync({
          inject: [
            UserLookupServiceFixture,
            UserMutateServiceFixture,
            OtpServiceFixture,
            EmailService,
          ],
          useFactory: (
            userLookupService,
            userMutateService,
            otpService,
            emailService,
          ) => ({
            userLookupService,
            userMutateService,
            otpService,
            emailService,
          }),
        }),
      ]);

      testModule = await Test.createTestingModule({
        imports: [
          { module: GlobalModule, ...globalModule },
          {
            module: ForFeatureModule,
            imports: [
              AuthRecoveryModule.forFeature({
                emailService: ffEmailService,
                otpService: ffOtpService,
                userLookupService: ffUserLookupService,
                userMutateService: ffUserMutateService,
              }),
            ],
            providers: [TestService],
          },
        ],
      }).compile();

      testService = testModule.get(TestService);
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });

    it('should have custom providers', async () => {
      commonVars();
      expect(testService.emailService).toBe(ffEmailService);
      expect(testService.emailService).not.toBe(emailService);
      expect(testService.otpService).toBe(ffOtpService);
      expect(testService.otpService).not.toBe(otpService);
      expect(testService.userLookupService).toBe(ffUserLookupService);
      expect(testService.userLookupService).not.toBe(userLookupService);
      expect(testService.userMutateService).toBe(ffUserMutateService);
      expect(testService.userMutateService).not.toBe(userMutateService);
    });
  });

  function commonVars() {
    authRecoveryModule = testModule.get<AuthRecoveryModule>(AuthRecoveryModule);
    otpService =
      testModule.get<AuthRecoveryOtpServiceInterface>(OtpServiceFixture);
    emailService = testModule.get<EmailService>(EmailService);
    userLookupService = testModule.get<AuthRecoveryUserLookupServiceInterface>(
      UserLookupServiceFixture,
    );
    userMutateService = testModule.get<AuthRecoveryUserMutateServiceInterface>(
      UserMutateServiceFixture,
    );
    authRecoveryService =
      testModule.get<AuthRecoveryService>(AuthRecoveryService);
    authRecoveryController = testModule.get<AuthRecoveryController>(
      AuthRecoveryController,
    );
  }

  function commonTests() {
    expect(authRecoveryModule).toBeInstanceOf(AuthRecoveryModule);
    expect(otpService).toBeInstanceOf(OtpServiceFixture);
    expect(emailService).toBeInstanceOf(EmailService);
    expect(userLookupService).toBeInstanceOf(UserLookupServiceFixture);
    expect(userMutateService).toBeInstanceOf(UserMutateServiceFixture);
    expect(authRecoveryService).toBeInstanceOf(AuthRecoveryService);
    expect(authRecoveryController).toBeInstanceOf(AuthRecoveryController);
  }
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [
      TypeOrmModuleFixture,
      UserModuleFixture,
      OtpModuleFixture,
      EmailModule.forRoot({ mailerService: new MailerServiceFixture() }),
      ...extraImports,
    ],
  };
}
