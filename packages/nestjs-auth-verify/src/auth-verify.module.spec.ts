import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';

import { EmailModule, EmailService } from '@concepta/nestjs-email';

import { AuthVerifyController } from './auth-verify.controller';
import { AuthVerifyModule } from './auth-verify.module';
import { AuthVerifyEmailServiceInterface } from './interfaces/auth-verify-email.service.interface';
import { AuthVerifyOtpServiceInterface } from './interfaces/auth-verify-otp.service.interface';
import { AuthVerifyUserLookupServiceInterface } from './interfaces/auth-verify-user-lookup.service.interface';
import { AuthVerifyUserMutateServiceInterface } from './interfaces/auth-verify-user-mutate.service.interface';
import { AuthVerifyServiceInterface } from './interfaces/auth-verify.service.interface';
import { AuthVerifyService } from './services/auth-verify.service';

import { MailerServiceFixture } from './__fixtures__/email/mailer.service.fixture';
import { OtpModuleFixture } from './__fixtures__/otp/otp.module.fixture';
import { OtpServiceFixture } from './__fixtures__/otp/otp.service.fixture';
import { TypeOrmModuleFixture } from './__fixtures__/typeorm.module.fixture';
import { UserLookupServiceFixture } from './__fixtures__/user/services/user-lookup.service.fixture';
import { UserMutateServiceFixture } from './__fixtures__/user/services/user-mutate.service.fixture';
import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';

describe(AuthVerifyModule, () => {
  let testModule: TestingModule;
  let authVerifyModule: AuthVerifyModule;
  let otpService: AuthVerifyOtpServiceInterface;
  let userLookupService: AuthVerifyUserLookupServiceInterface;
  let userMutateService: AuthVerifyUserMutateServiceInterface;
  let authVerifyService: AuthVerifyServiceInterface;
  let authVerifyController: AuthVerifyController;
  let emailService: EmailService;

  const mockEmailService = mock<AuthVerifyEmailServiceInterface>();

  describe(AuthVerifyModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthVerifyModule.forRoot({
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

  describe(AuthVerifyModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthVerifyModule.register({
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

  describe(AuthVerifyModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthVerifyModule.forRootAsync({
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

  describe(AuthVerifyModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthVerifyModule.registerAsync({
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

  function commonVars() {
    authVerifyModule = testModule.get<AuthVerifyModule>(AuthVerifyModule);
    otpService =
      testModule.get<AuthVerifyOtpServiceInterface>(OtpServiceFixture);
    emailService = testModule.get<EmailService>(EmailService);
    userLookupService = testModule.get<AuthVerifyUserLookupServiceInterface>(
      UserLookupServiceFixture,
    );
    userMutateService = testModule.get<AuthVerifyUserMutateServiceInterface>(
      UserMutateServiceFixture,
    );
    authVerifyService = testModule.get<AuthVerifyService>(AuthVerifyService);
    authVerifyController =
      testModule.get<AuthVerifyController>(AuthVerifyController);
  }

  function commonTests() {
    expect(authVerifyModule).toBeInstanceOf(AuthVerifyModule);
    expect(otpService).toBeInstanceOf(OtpServiceFixture);
    expect(emailService).toBeInstanceOf(EmailService);
    expect(userLookupService).toBeInstanceOf(UserLookupServiceFixture);
    expect(userMutateService).toBeInstanceOf(UserMutateServiceFixture);
    expect(authVerifyService).toBeInstanceOf(AuthVerifyService);
    expect(authVerifyController).toBeInstanceOf(AuthVerifyController);
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
