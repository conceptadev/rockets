import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  AUTHENTICATION_MODULE_SETTINGS_TOKEN,
  AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN,
} from './core/authentication.constants';

import { AuthenticationSettingsInterface } from './core/interfaces/authentication-settings.interface';
import { IssueTokenServiceInterface } from './core/interfaces/issue-token-service.interface';
import { VerifyTokenServiceInterface } from './core/interfaces/verify-token-service.interface';
import { ValidateTokenServiceInterface } from './core/interfaces/validate-token-service.interface';

import { AuthenticationModule } from './authentication.module';
import { VerifyTokenService } from './jwt/services/verify-token.service';
import { IssueTokenService } from './jwt/services/issue-token.service';

import { GlobalModuleFixture } from './__fixtures__/global.module.fixture';
import { ValidateTokenServiceFixture } from './__fixtures__/services/validate-token.service.fixture';
import { VerifyTokenServiceFixture } from './__fixtures__/services/verify-token.service.fixture';
import { IssueTokenServiceFixture } from './__fixtures__/services/issue-token.service.fixture';
import { JwtModule } from './jwt/jwt.module';

describe(AuthenticationModule, () => {
  let testModule: TestingModule;
  let authenticationModule: AuthenticationModule;
  let issueTokenService: IssueTokenServiceInterface;
  let verifyTokenService: VerifyTokenServiceInterface;
  let validateTokenService: ValidateTokenServiceInterface;

  describe(AuthenticationModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthenticationModule.forRoot({
            verifyTokenService: new VerifyTokenServiceFixture(),
            issueTokenService: new IssueTokenServiceFixture(),
            validateTokenService: new ValidateTokenServiceFixture(),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(AuthenticationModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthenticationModule.register({
            verifyTokenService: new VerifyTokenServiceFixture(),
            issueTokenService: new IssueTokenServiceFixture(),
            validateTokenService: new ValidateTokenServiceFixture(),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars();
      commonTests();
    });
  });

  describe(AuthenticationModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthenticationModule.forRootAsync({
            inject: [
              VerifyTokenServiceFixture,
              IssueTokenServiceFixture,
              ValidateTokenServiceFixture,
            ],
            useFactory: (
              verifyTokenService: VerifyTokenServiceInterface,
              issueTokenService: IssueTokenServiceInterface,
              validateTokenService: ValidateTokenServiceInterface,
            ) => ({
              verifyTokenService,
              issueTokenService,
              validateTokenService,
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

  describe(AuthenticationModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthenticationModule.registerAsync({
            inject: [
              VerifyTokenServiceFixture,
              IssueTokenServiceFixture,
              ValidateTokenServiceFixture,
            ],
            useFactory: (
              verifyTokenService: VerifyTokenServiceInterface,
              issueTokenService: IssueTokenServiceInterface,
              validateTokenService: ValidateTokenServiceInterface,
            ) => ({
              verifyTokenService,
              issueTokenService,
              validateTokenService,
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

  describe(AuthenticationModule.forFeature, () => {
    @Module({})
    class GlobalModule {}

    @Module({})
    class ForFeatureModule {}

    @Injectable()
    class TestService {
      constructor(
        @Inject(AUTHENTICATION_MODULE_SETTINGS_TOKEN)
        public settings: AuthenticationSettingsInterface,
        @Inject(VerifyTokenService)
        public verifyTokenService: VerifyTokenServiceFixture,
        @Inject(IssueTokenService)
        public issueTokenService: IssueTokenServiceFixture,
        @Inject(AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN)
        public validateTokenService: ValidateTokenServiceFixture,
      ) {}
    }

    @Injectable()
    class CustomTestService {
      constructor(
        @Inject(AUTHENTICATION_MODULE_SETTINGS_TOKEN)
        public settings: AuthenticationSettingsInterface,
        @Inject(VerifyTokenService)
        public verifyTokenService: VerifyTokenServiceFixture,
        @Inject(IssueTokenService)
        public issueTokenService: IssueTokenServiceFixture,
        @Inject(AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN)
        public validateTokenService: ValidateTokenServiceFixture,
      ) {}
    }

    let testService: TestService;
    let customTestService: CustomTestService;

    const ffVerifyTokenService = new VerifyTokenServiceFixture();
    const ffIssueTokenService = new IssueTokenServiceFixture();
    const ffValidateTokenService = new ValidateTokenServiceFixture();

    ffVerifyTokenService.discriminator = 'forFeature';
    ffIssueTokenService.discriminator = 'forFeature';
    ffValidateTokenService.discriminator = 'forFeature';

    beforeEach(async () => {
      const globalModule = testModuleFactory([
        AuthenticationModule.forRootAsync({
          inject: [
            VerifyTokenServiceFixture,
            IssueTokenServiceFixture,
            ValidateTokenServiceFixture,
          ],
          useFactory: (
            verifyTokenService: VerifyTokenServiceInterface,
            issueTokenService: IssueTokenServiceInterface,
            validateTokenService: ValidateTokenServiceInterface,
          ) => ({
            verifyTokenService,
            issueTokenService,
            validateTokenService,
          }),
        }),
      ]);

      testModule = await Test.createTestingModule({
        imports: [
          { module: GlobalModule, ...globalModule, providers: [TestService] },
          {
            module: ForFeatureModule,
            imports: [
              AuthenticationModule.forFeature({
                verifyTokenService: ffVerifyTokenService,
                issueTokenService: ffIssueTokenService,
                validateTokenService: ffValidateTokenService,
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

      expect(testService.verifyTokenService.discriminator).toEqual('default');
      expect(testService.issueTokenService.discriminator).toEqual('default');
      expect(testService.validateTokenService.discriminator).toEqual('default');

      expect(customTestService.verifyTokenService.discriminator).toEqual(
        'forFeature',
      );
      expect(customTestService.issueTokenService.discriminator).toEqual(
        'forFeature',
      );
      expect(customTestService.validateTokenService.discriminator).toEqual(
        'forFeature',
      );

      expect(customTestService.verifyTokenService).toBe(ffVerifyTokenService);
      expect(customTestService.issueTokenService).toBe(ffIssueTokenService);
      expect(customTestService.validateTokenService).toBe(
        ffValidateTokenService,
      );
    });
  });

  function commonVars() {
    authenticationModule = testModule.get(AuthenticationModule);
    verifyTokenService = testModule.get(VerifyTokenService);
    issueTokenService = testModule.get(IssueTokenService);
    validateTokenService = testModule.get(
      AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN,
    );
  }

  function commonTests() {
    expect(authenticationModule).toBeInstanceOf(AuthenticationModule);
    expect(issueTokenService).toBeInstanceOf(IssueTokenServiceFixture);
    expect(verifyTokenService).toBeInstanceOf(VerifyTokenServiceFixture);
    expect(validateTokenService).toBeInstanceOf(ValidateTokenServiceFixture);
  }
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [GlobalModuleFixture, JwtModule.forRoot({}), ...extraImports],
  };
}
