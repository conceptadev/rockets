import { mock } from 'jest-mock-extended';
import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  ModuleMetadata,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtModule, JwtVerifyService } from '@concepta/nestjs-jwt';
import {
  AuthenticationModule,
  VerifyTokenService,
  VerifyTokenServiceInterface,
} from '@concepta/nestjs-authentication';

import {
  AUTH_JWT_MODULE_SETTINGS_TOKEN,
  AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
} from './auth-jwt.constants';

import { AuthJwtModule } from './auth-jwt.module';
import { AuthJwtSettingsInterface } from './interfaces/auth-jwt-settings.interface';
import { AuthJwtUserLookupServiceInterface } from './interfaces/auth-jwt-user-lookup-service.interface';

import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';
import { UserLookupServiceFixture } from './__fixtures__/user/user-lookup.service.fixture';

describe(AuthJwtModule, () => {
  const jwtVerifyService = mock<JwtVerifyService>();

  let testModule: TestingModule;
  let authJwtModule: AuthJwtModule;
  let userLookupService: AuthJwtUserLookupServiceInterface;
  let verifyTokenService: VerifyTokenService;

  describe(AuthJwtModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthJwtModule.forRoot({
            verifyTokenService: new VerifyTokenService(jwtVerifyService),
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

  describe(AuthJwtModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthJwtModule.register({
            verifyTokenService: new VerifyTokenService(jwtVerifyService),
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

  describe(AuthJwtModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthJwtModule.forRootAsync({
            inject: [VerifyTokenService, UserLookupServiceFixture],
            useFactory: (
              verifyTokenService: VerifyTokenService,
              userLookupService: AuthJwtUserLookupServiceInterface,
            ) => ({ verifyTokenService, userLookupService }),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars(testModule);
      commonTests();
    });
  });

  describe(AuthJwtModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthJwtModule.registerAsync({
            inject: [VerifyTokenService, UserLookupServiceFixture],
            useFactory: (
              verifyTokenService: VerifyTokenService,
              userLookupService: UserLookupServiceFixture,
            ) => ({ verifyTokenService, userLookupService }),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars(testModule);
      commonTests();
    });
  });

  describe(AuthJwtModule.forFeature, () => {
    @Module({})
    class GlobalModule {}

    @Module({})
    class ForFeatureModule {}

    @Injectable()
    class TestService {
      constructor(
        @Inject(AUTH_JWT_MODULE_SETTINGS_TOKEN)
        public settings: AuthJwtSettingsInterface,
        @Inject(AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN)
        public userLookupService: AuthJwtUserLookupServiceInterface,
        @Inject(AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN)
        public verifyTokenService: VerifyTokenServiceInterface,
      ) {}
    }

    let testService: TestService;
    const fromReqFunc = (): string => {
      return 'hi';
    };
    const verifyTokenFunc = (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      token: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      done: (err?: Error, decodedToken?: unknown) => void,
    ) => undefined;
    const ffUserLookupService = new UserLookupServiceFixture();
    const ffVerifyTokenService = new VerifyTokenService(jwtVerifyService);

    beforeEach(async () => {
      const globalModule = testModuleFactory([
        AuthJwtModule.forRootAsync({
          inject: [VerifyTokenService, UserLookupServiceFixture],
          useFactory: (
            verifyTokenService: VerifyTokenService,
            userLookupService: AuthJwtUserLookupServiceInterface,
          ) => ({ verifyTokenService, userLookupService }),
        }),
      ]);

      testModule = await Test.createTestingModule({
        imports: [
          { module: GlobalModule, ...globalModule },
          {
            module: ForFeatureModule,
            imports: [
              AuthJwtModule.forFeature({
                userLookupService: ffUserLookupService,
                verifyTokenService: ffVerifyTokenService,
                settings: {
                  jwtFromRequest: fromReqFunc,
                  verifyToken: verifyTokenFunc,
                },
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
      expect(testService.settings.jwtFromRequest).toBe(fromReqFunc);
      expect(testService.settings.verifyToken).toBe(verifyTokenFunc);
      expect(testService.userLookupService).toBe(ffUserLookupService);
      expect(testService.userLookupService).not.toBe(userLookupService);
      expect(testService.verifyTokenService).toBe(ffVerifyTokenService);
      expect(testService.verifyTokenService).not.toBe(verifyTokenService);
    });
  });

  function commonVars(module: TestingModule) {
    authJwtModule = module.get(AuthJwtModule);
    userLookupService = module.get(UserLookupServiceFixture);
    verifyTokenService = module.get(VerifyTokenService);
  }

  function commonTests() {
    expect(authJwtModule).toBeInstanceOf(AuthJwtModule);
    expect(userLookupService).toBeInstanceOf(UserLookupServiceFixture);
    expect(verifyTokenService).toBeInstanceOf(VerifyTokenService);
  }
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [
      AuthenticationModule.forRoot({}),
      JwtModule.forRoot({}),
      UserModuleFixture,
      ...extraImports,
    ],
  };
}
