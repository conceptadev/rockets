import { mock } from 'jest-mock-extended';
import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EmailModule, EmailService } from '@concepta/nestjs-email';

import { AuthRecoveryOtpServiceInterface } from './interfaces/auth-recovery-otp.service.interface';
import { AuthRecoveryEmailServiceInterface } from './interfaces/auth-recovery-email.service.interface';
import { AuthRecoveryUserModelServiceInterface } from './interfaces/auth-recovery-user-model.service.interface';
import { AuthRecoveryServiceInterface } from './interfaces/auth-recovery.service.interface';
import { AuthRecoveryController } from './auth-recovery.controller';
import { AuthRecoveryModule } from './auth-recovery.module';
import { AuthRecoveryService } from './services/auth-recovery.service';

import { UserModelServiceFixture } from './__fixtures__/user/services/user-model.service.fixture';
import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';
import { OtpModuleFixture } from './__fixtures__/otp/otp.module.fixture';
import { UserPasswordServiceFixture } from './__fixtures__/user/services/user-password.service.fixture';
import { OtpServiceFixture } from './__fixtures__/otp/otp.service.fixture';
import { MailerServiceFixture } from './__fixtures__/email/mailer.service.fixture';
import { UserPasswordServiceInterface } from '@concepta/nestjs-user';

describe(AuthRecoveryModule, () => {
  let testModule: TestingModule;
  let authRecoveryModule: AuthRecoveryModule;
  let otpService: AuthRecoveryOtpServiceInterface;
  let userModelService: AuthRecoveryUserModelServiceInterface;
  let userPasswordService: UserPasswordServiceInterface;
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
            userModelService: new UserModelServiceFixture(),
            userPasswordService: new UserPasswordServiceFixture(),
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
            userModelService: new UserModelServiceFixture(),
            userPasswordService: new UserPasswordServiceFixture(),
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
              UserModelServiceFixture,
              UserPasswordServiceFixture,
              OtpServiceFixture,
              EmailService,
            ],
            useFactory: (
              userModelService,
              userPasswordService,
              otpService,
              emailService,
            ) => ({
              userModelService,
              userPasswordService,
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
              UserModelServiceFixture,
              UserPasswordServiceFixture,
              OtpServiceFixture,
              EmailService,
            ],
            useFactory: (
              userModelService,
              userPasswordService,
              otpService,
              emailService,
            ) => ({
              userModelService,
              userPasswordService,
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
    authRecoveryModule = testModule.get<AuthRecoveryModule>(AuthRecoveryModule);
    otpService =
      testModule.get<AuthRecoveryOtpServiceInterface>(OtpServiceFixture);
    emailService = testModule.get<EmailService>(EmailService);
    userModelService = testModule.get<AuthRecoveryUserModelServiceInterface>(
      UserModelServiceFixture,
    );
    userPasswordService = testModule.get<UserPasswordServiceInterface>(
      UserPasswordServiceFixture,
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
    expect(userModelService).toBeInstanceOf(UserModelServiceFixture);
    expect(userPasswordService).toBeInstanceOf(UserPasswordServiceFixture);
    expect(authRecoveryService).toBeInstanceOf(AuthRecoveryService);
    expect(authRecoveryController).toBeInstanceOf(AuthRecoveryController);
  }
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [
      UserModuleFixture,
      OtpModuleFixture,
      EmailModule.forRoot({ mailerService: new MailerServiceFixture() }),
      ...extraImports,
    ],
  };
}
