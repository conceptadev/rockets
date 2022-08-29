import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import {
  JwtIssueService,
  JwtModule,
  JwtSignService,
} from '@concepta/nestjs-jwt';
import {
  AuthenticationModule,
  IssueTokenService,
  IssueTokenServiceInterface,
} from '@concepta/nestjs-authentication';

import {
  AUTH_LOCAL_MODULE_ISSUE_TOKEN_SERVICE_TOKEN,
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
  AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN,
} from './auth-local.constants';

import { AuthLocalModule } from './auth-local.module';
import { AuthLocalUserLookupServiceInterface } from './interfaces/auth-local-user-lookup-service.interface';
import { AuthLocalSettingsInterface } from './interfaces/auth-local-settings.interface';

import { UserLookupServiceFixture } from './__fixtures__/user/user-lookup.service.fixture';
import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';

describe(AuthLocalModule, () => {
  const jwtAccessService = new NestJwtService();
  const jwtRefreshService = new NestJwtService();
  const jwtSignService = new JwtSignService(
    jwtAccessService,
    jwtRefreshService,
  );
  const jwtIssueService = new JwtIssueService(jwtSignService);

  let testModule: TestingModule;
  let authLocalModule: AuthLocalModule;
  let userLookupService: AuthLocalUserLookupServiceInterface;
  let issueTokenService: IssueTokenServiceInterface;

  describe(AuthLocalModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthLocalModule.forRoot({
            issueTokenService: new IssueTokenService(jwtIssueService),
            userLookupService: new UserLookupServiceFixture(),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars(testModule);
      commonTests();
    });
  });

  describe(AuthLocalModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthLocalModule.register({
            issueTokenService: new IssueTokenService(jwtIssueService),
            userLookupService: new UserLookupServiceFixture(),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars(testModule);
      commonTests();
    });
  });

  describe(AuthLocalModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthLocalModule.forRootAsync({
            inject: [IssueTokenService, UserLookupServiceFixture],
            useFactory: (
              issueTokenService: IssueTokenServiceInterface,
              userLookupService: AuthLocalUserLookupServiceInterface,
            ) => ({ issueTokenService, userLookupService }),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars(testModule);
      commonTests();
    });
  });

  describe(AuthLocalModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthLocalModule.registerAsync({
            inject: [IssueTokenService, UserLookupServiceFixture],
            useFactory: (
              issueTokenService: IssueTokenService,
              userLookupService: AuthLocalUserLookupServiceInterface,
            ) => ({ issueTokenService, userLookupService }),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars(testModule);
      commonTests();
    });
  });

  describe(AuthLocalModule.forFeature, () => {
    @Module({})
    class GlobalModule {}

    @Module({})
    class ForFeatureModule {}

    @Injectable()
    class TestService {
      constructor(
        @Inject(AUTH_LOCAL_MODULE_SETTINGS_TOKEN)
        public settings: AuthLocalSettingsInterface,
        @Inject(AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN)
        public userLookupService: AuthLocalUserLookupServiceInterface,
        @Inject(AUTH_LOCAL_MODULE_ISSUE_TOKEN_SERVICE_TOKEN)
        public issueTokenService: IssueTokenServiceInterface,
      ) {}
    }

    let testService: TestService;
    const ffUserLookupService = new UserLookupServiceFixture();
    const ffIssueTokenService = new IssueTokenService(jwtIssueService);

    beforeEach(async () => {
      const globalModule = testModuleFactory([
        AuthLocalModule.forRootAsync({
          inject: [IssueTokenService, UserLookupServiceFixture],
          useFactory: (
            issueTokenService: IssueTokenService,
            userLookupService: UserLookupServiceFixture,
          ) => ({ issueTokenService, userLookupService }),
        }),
      ]);

      testModule = await Test.createTestingModule({
        imports: [
          { module: GlobalModule, ...globalModule },
          {
            module: ForFeatureModule,
            imports: [
              AuthLocalModule.forFeature({
                userLookupService: ffUserLookupService,
                issueTokenService: ffIssueTokenService,
                settings: {},
              }),
            ],
            providers: [TestService],
          },
        ],
      }).compile();

      testService = testModule.get(TestService);
    });

    it('module should be loaded', async () => {
      commonVars(testModule);
      commonTests();
    });

    it('should have custom providers', async () => {
      commonVars(testModule);
      expect(testService.userLookupService).toBe(ffUserLookupService);
      expect(testService.userLookupService).not.toBe(userLookupService);
      expect(testService.issueTokenService).toBe(ffIssueTokenService);
      expect(testService.issueTokenService).not.toBe(issueTokenService);
    });
  });

  function commonVars(module: TestingModule) {
    authLocalModule = module.get(AuthLocalModule);
    userLookupService = module.get(UserLookupServiceFixture);
    issueTokenService = module.get(IssueTokenService);
  }

  function commonTests() {
    expect(authLocalModule).toBeInstanceOf(AuthLocalModule);
    expect(userLookupService).toBeInstanceOf(UserLookupServiceFixture);
    expect(issueTokenService).toBeInstanceOf(IssueTokenService);
  }
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [
      UserModuleFixture,
      AuthenticationModule.forRoot({}),
      JwtModule.forRoot({}),
      ...extraImports,
    ],
  };
}
