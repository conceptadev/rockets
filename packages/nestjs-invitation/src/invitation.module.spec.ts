import { mock } from 'jest-mock-extended';
import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EventModule } from '@concepta/nestjs-event';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { EmailModule, EmailService } from '@concepta/nestjs-email';
import { CrudModule } from '@concepta/nestjs-crud';

import {
  INVITATION_MODULE_OTP_SERVICE_TOKEN,
  INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN,
} from './invitation.constants';

import { InvitationModule } from './invitation.module';
import { InvitationOtpServiceInterface } from './interfaces/services/invitation-otp-service.interface';

import { InvitationUserLookupServiceInterface } from './interfaces/services/invitation-user-lookup.service.interface';
import { InvitationUserMutateServiceInterface } from './interfaces/services/invitation-user-mutate.service.interface';
import { InvitationServiceInterface } from './interfaces/services/invitation-service.interface';
import { InvitationController } from './controllers/invitation.controller';
import { InvitationAcceptanceController } from './controllers/invitation-acceptance.controller';
import { InvitationReattemptController } from './controllers/invitation-reattempt.controller';
import { InvitationService } from './services/invitation.service';
import { InvitationSendService } from './services/invitation-send.service';
import { InvitationAcceptanceService } from './services/invitation-acceptance.service';
import { InvitationRevocationService } from './services/invitation-revocation.service';
import { InvitationEmailServiceInterface } from './interfaces/services/invitation-email-service.interface';

import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';
import { UserLookupServiceFixture } from './__fixtures__/user/services/user-lookup.service.fixture';
import { UserMutateServiceFixture } from './__fixtures__/user/services/user-mutate.service.fixture';
import { OtpModuleFixture } from './__fixtures__/otp/otp.module.fixture';
import { OtpServiceFixture } from './__fixtures__/otp/otp.service.fixture';
import { MailerServiceFixture } from './__fixtures__/email/mailer.service.fixture';
import { InvitationEntityFixture } from './__fixtures__/invitation/entities/invitation.entity.fixture';
import { default as ormConfig } from './__fixtures__/ormconfig.fixture';
import { InvitationSendServiceInterface } from './interfaces/services/invitation-send-service.interface';
import { InvitationSendServiceFixture } from './__fixtures__/invitation/entities/invitation-send.service.fixture';
import { InvitationLocalModuleFixture } from './__fixtures__/invitation/entities/invitation-local.module.fixture';

describe(InvitationModule, () => {
  let testModule: TestingModule;
  let invitationModule: InvitationModule;
  let otpService: InvitationOtpServiceInterface;
  let emailService: InvitationEmailServiceInterface;
  let userLookupService: InvitationUserLookupServiceInterface;
  let userMutateService: InvitationUserMutateServiceInterface;
  let invitationService: InvitationServiceInterface;
  let invitationSendService: InvitationSendServiceInterface;
  let invitationAcceptanceService: InvitationAcceptanceService;
  let invitationRevocationService: InvitationRevocationService;
  let invitationController: InvitationController;
  let invitationAcceptanceController: InvitationAcceptanceController;
  let invitationReattemptController: InvitationReattemptController;

  const mockEmailService = mock<InvitationEmailServiceInterface>();

  describe(InvitationModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          InvitationModule.forRoot({
            emailService: mockEmailService,
            otpService: new OtpServiceFixture(),
            userLookupService: new UserLookupServiceFixture(),
            userMutateService: new UserMutateServiceFixture(),
            invitationSendService: new InvitationSendServiceFixture(),
            entities: {
              invitation: {
                entity: InvitationEntityFixture,
              },
            },
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(InvitationModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          InvitationModule.forRoot({
            emailService: mockEmailService,
            otpService: new OtpServiceFixture(),
            userLookupService: new UserLookupServiceFixture(),
            userMutateService: new UserMutateServiceFixture(),
            entities: {
              invitation: {
                entity: InvitationEntityFixture,
              },
            },
          }),
        ]),
      ).compile();
    });

    it('check send service type for default send service', async () => {
      invitationSendService = testModule.get<InvitationSendServiceInterface>(
        InvitationSendService,
      );
      // check the default
      expect(invitationSendService).toBeInstanceOf(InvitationSendService);
    });
  });

  afterEach(async () => {
    testModule && (await testModule.close());
  });

  describe(InvitationModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          InvitationModule.register({
            emailService: mockEmailService,
            otpService: new OtpServiceFixture(),
            userLookupService: new UserLookupServiceFixture(),
            userMutateService: new UserMutateServiceFixture(),
            invitationSendService: new InvitationSendServiceFixture(),
            entities: {
              invitation: {
                entity: InvitationEntityFixture,
              },
            },
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  afterEach(async () => {
    testModule && (await testModule.close());
  });

  describe(InvitationModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          InvitationModule.forRootAsync({
            inject: [
              UserLookupServiceFixture,
              UserMutateServiceFixture,
              OtpServiceFixture,
              EmailService,
              InvitationSendServiceFixture,
            ],
            useFactory: (
              userLookupService,
              userMutateService,
              otpService,
              emailService,
              invitationSendService,
            ) => ({
              userLookupService,
              userMutateService,
              otpService,
              emailService,
              invitationSendService,
            }),
            entities: {
              invitation: {
                entity: InvitationEntityFixture,
              },
            },
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  afterEach(async () => {
    testModule && (await testModule.close());
  });

  describe(InvitationModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          InvitationModule.registerAsync({
            inject: [
              UserLookupServiceFixture,
              UserMutateServiceFixture,
              OtpServiceFixture,
              EmailService,
              InvitationSendServiceFixture,
            ],
            useFactory: (
              userLookupService,
              userMutateService,
              otpService,
              emailService,
              invitationSendService,
            ) => ({
              userLookupService,
              userMutateService,
              otpService,
              emailService,
              invitationSendService,
            }),
            entities: {
              invitation: {
                entity: InvitationEntityFixture,
              },
            },
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  afterEach(async () => {
    testModule && (await testModule.close());
  });

  function commonVars() {
    invitationModule = testModule.get<InvitationModule>(InvitationModule);

    emailService =
      testModule.get<InvitationEmailServiceInterface>(EmailService);

    otpService = testModule.get<InvitationOtpServiceInterface>(
      INVITATION_MODULE_OTP_SERVICE_TOKEN,
    );

    userLookupService = testModule.get<InvitationUserLookupServiceInterface>(
      INVITATION_MODULE_USER_LOOKUP_SERVICE_TOKEN,
    );

    userMutateService = testModule.get<InvitationUserMutateServiceInterface>(
      INVITATION_MODULE_USER_MUTATE_SERVICE_TOKEN,
    );

    invitationService = testModule.get<InvitationService>(InvitationService);

    invitationSendService = testModule.get<InvitationSendServiceInterface>(
      InvitationSendService,
    );

    invitationAcceptanceService = testModule.get<InvitationAcceptanceService>(
      InvitationAcceptanceService,
    );

    invitationRevocationService = testModule.get<InvitationRevocationService>(
      InvitationRevocationService,
    );

    invitationController =
      testModule.get<InvitationController>(InvitationController);

    invitationAcceptanceController =
      testModule.get<InvitationAcceptanceController>(
        InvitationAcceptanceController,
      );

    invitationReattemptController =
      testModule.get<InvitationReattemptController>(
        InvitationReattemptController,
      );
  }

  function commonTests() {
    expect(invitationModule).toBeInstanceOf(InvitationModule);
    expect(otpService).toBeInstanceOf(OtpServiceFixture);
    expect(emailService).toBeInstanceOf(EmailService);
    expect(userLookupService).toBeInstanceOf(UserLookupServiceFixture);
    expect(userMutateService).toBeInstanceOf(UserMutateServiceFixture);
    expect(invitationService).toBeInstanceOf(InvitationService);
    expect(invitationSendService).toBeInstanceOf(InvitationSendServiceFixture);
    expect(invitationAcceptanceService).toBeInstanceOf(
      InvitationAcceptanceService,
    );
    expect(invitationRevocationService).toBeInstanceOf(
      InvitationRevocationService,
    );

    expect(invitationController).toBeInstanceOf(InvitationController);
    expect(invitationAcceptanceController).toBeInstanceOf(
      InvitationAcceptanceController,
    );

    expect(invitationReattemptController).toBeInstanceOf(
      InvitationReattemptController,
    );
  }
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [
      TypeOrmExtModule.forRoot(ormConfig),
      EventModule.forRoot({}),
      CrudModule.forRoot({}),
      UserModuleFixture,
      OtpModuleFixture,
      InvitationLocalModuleFixture,
      EmailModule.forRoot({ mailerService: new MailerServiceFixture() }),
      ...extraImports,
    ],
  };
}
