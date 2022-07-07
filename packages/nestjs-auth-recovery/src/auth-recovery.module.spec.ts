import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { UserLookupService, UserMutateService } from '@concepta/nestjs-user';
import { OtpService } from '@concepta/nestjs-otp';
import { EmailService } from '@concepta/nestjs-email';

import { AuthRecoveryModule } from './auth-recovery.module';
import { AuthRecoveryAppModuleFixture } from './__fixtures__/auth-recovery.app.module.fixture';
import { AuthRecoveryService } from './services/auth-recovery.service';
import { AuthRecoveryController } from './auth-recovery.controller';

describe('AuthRecoveryModuleTest', () => {
  let authRecoveryModule: AuthRecoveryModule;
  let otpService: OtpService;
  let emailService: EmailService;
  let userLookupService: UserLookupService;
  let userMutateService: UserMutateService;
  let authRecoveryService: AuthRecoveryService;
  let authRecoveryController: AuthRecoveryController;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AuthRecoveryAppModuleFixture],
    }).compile();

    authRecoveryModule = testModule.get<AuthRecoveryModule>(AuthRecoveryModule);
    otpService = testModule.get<OtpService>(OtpService);
    emailService = testModule.get<EmailService>(EmailService);
    userLookupService = testModule.get<UserLookupService>(UserLookupService);
    userMutateService = testModule.get<UserMutateService>(UserMutateService);
    authRecoveryService =
      testModule.get<AuthRecoveryService>(AuthRecoveryService);
    authRecoveryController = testModule.get<AuthRecoveryController>(
      AuthRecoveryController,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(authRecoveryModule).toBeInstanceOf(AuthRecoveryModule);
      expect(otpService).toBeInstanceOf(OtpService);
      expect(emailService).toBeInstanceOf(EmailService);
      expect(userLookupService).toBeInstanceOf(UserLookupService);
      expect(userMutateService).toBeInstanceOf(UserMutateService);
      expect(authRecoveryService).toBeInstanceOf(AuthRecoveryService);
      expect(authRecoveryController).toBeInstanceOf(AuthRecoveryController);

      expect(userLookupService['repo']).toBeInstanceOf(Repository);
      expect(userMutateService['repo']).toBeInstanceOf(Repository);
    });
  });
});
