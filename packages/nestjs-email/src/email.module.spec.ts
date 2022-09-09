import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailSendInterface } from '@concepta/ts-common';

import { EMAIL_MODULE_MAILER_SERVICE_TOKEN } from './email.constants';

import { EmailServiceInterface } from './interfaces/email-service.interface';
import { EmailModule } from './email.module';
import { EmailService } from './email.service';

import { GlobalModuleFixture } from './__fixtures__/global.module.fixture';
import { MailerServiceFixture } from './__fixtures__/mailer.service.fixture';

describe(EmailModule, () => {
  let testModule: TestingModule;
  let emailModule: EmailModule;
  let mailerService: EmailSendInterface;
  let emailService: EmailServiceInterface;

  describe(EmailModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          EmailModule.forRoot({
            mailerService: new MailerServiceFixture(),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(EmailModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          EmailModule.register({
            mailerService: new MailerServiceFixture(),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(EmailModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          EmailModule.forRootAsync({
            inject: [MailerServiceFixture],
            useFactory: (mailerService: EmailSendInterface) => ({
              mailerService,
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

  describe(EmailModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          EmailModule.registerAsync({
            inject: [MailerServiceFixture],
            useFactory: (mailerService: EmailSendInterface) => ({
              mailerService,
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

  describe(EmailModule.forFeature, () => {
    @Module({})
    class GlobalModule {}

    @Module({})
    class ForFeatureModule {}

    @Injectable()
    class TestService {
      constructor(
        @Inject(EMAIL_MODULE_MAILER_SERVICE_TOKEN)
        public mailerService: MailerServiceFixture,
      ) {}
    }

    @Injectable()
    class CustomTestService {
      constructor(
        @Inject(EMAIL_MODULE_MAILER_SERVICE_TOKEN)
        public mailerService: MailerServiceFixture,
      ) {}
    }

    let testService: TestService;
    let customTestService: CustomTestService;

    const ffMailerService = new MailerServiceFixture();

    ffMailerService.discriminator = 'forFeature';

    beforeEach(async () => {
      const globalModule = testModuleFactory([
        EmailModule.forRootAsync({
          inject: [MailerServiceFixture],
          useFactory: (mailerService: EmailSendInterface) => ({
            mailerService,
          }),
        }),
      ]);

      testModule = await Test.createTestingModule({
        imports: [
          { module: GlobalModule, ...globalModule, providers: [TestService] },
          {
            module: ForFeatureModule,
            imports: [
              EmailModule.forFeature({
                mailerService: ffMailerService,
              }),
            ],
            providers: [CustomTestService],
          },
        ],
      }).compile();

      testService = testModule.get(TestService);
      customTestService = testModule.get(CustomTestService);
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });

    it('should have custom providers', async () => {
      commonVars();

      expect(testService.mailerService.discriminator).toEqual('default');

      expect(customTestService.mailerService.discriminator).toEqual(
        'forFeature',
      );

      expect(customTestService.mailerService).toBe(ffMailerService);
    });
  });

  function commonVars() {
    emailModule = testModule.get(EmailModule);
    mailerService = testModule.get(EMAIL_MODULE_MAILER_SERVICE_TOKEN);
    emailService = testModule.get(EmailService);
  }

  function commonTests() {
    expect(emailModule).toBeInstanceOf(EmailModule);
    expect(mailerService).toBeInstanceOf(MailerServiceFixture);
    expect(emailService).toBeInstanceOf(EmailService);
  }
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [GlobalModuleFixture, ...extraImports],
  };
}
