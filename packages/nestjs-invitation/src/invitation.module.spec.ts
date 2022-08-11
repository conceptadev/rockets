import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { UserLookupService, UserMutateService } from '@concepta/nestjs-user';
import { OtpService } from '@concepta/nestjs-otp';
import { EmailService } from '@concepta/nestjs-email';

import { InvitationModule } from './invitation.module';
import { InvitationService } from './services/invitation.service';
import { InvitationController } from './controllers/invitation.controller';

import { InvitationAppModuleFixture } from './__fixtures__/invitation.app.module.fixture';

describe(InvitationModule, () => {
  let invitationModule: InvitationModule;
  let otpService: OtpService;
  let emailService: EmailService;
  let userLookupService: UserLookupService;
  let userMutateService: UserMutateService;
  let invitationService: InvitationService;
  let invitationController: InvitationController;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [InvitationAppModuleFixture],
    }).compile();

    invitationModule = testModule.get<InvitationModule>(InvitationModule);
    otpService = testModule.get<OtpService>(OtpService);
    emailService = testModule.get<EmailService>(EmailService);
    userLookupService = testModule.get<UserLookupService>(UserLookupService);
    userMutateService = testModule.get<UserMutateService>(UserMutateService);
    invitationService = testModule.get<InvitationService>(InvitationService);
    invitationController =
      testModule.get<InvitationController>(InvitationController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(invitationModule).toBeInstanceOf(InvitationModule);
      expect(otpService).toBeInstanceOf(OtpService);
      expect(emailService).toBeInstanceOf(EmailService);
      expect(userLookupService).toBeInstanceOf(UserLookupService);
      expect(userMutateService).toBeInstanceOf(UserMutateService);
      expect(invitationService).toBeInstanceOf(InvitationService);
      expect(invitationController).toBeInstanceOf(InvitationController);

      expect(userLookupService['repo']).toBeInstanceOf(Repository);
      expect(userMutateService['repo']).toBeInstanceOf(Repository);
    });
  });
});
