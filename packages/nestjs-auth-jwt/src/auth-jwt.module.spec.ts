import { DataSource, EntityManager, Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
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
  JwtModule,
  JwtSignService,
  JwtVerifyService,
} from '@concepta/nestjs-jwt';

import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import {
  UserModule,
  UserLookupService,
  UserLookupServiceInterface,
} from '@concepta/nestjs-user';
import {
  AuthenticationModule,
  VerifyTokenService,
  VerifyTokenServiceInterface,
} from '@concepta/nestjs-authentication';

import { AuthJwtModule } from './auth-jwt.module';

import { UserEntityFixture } from './__fixtures__/user/user.entity.fixture';
import {
  AUTH_JWT_MODULE_SETTINGS_TOKEN,
  AUTH_JWT_MODULE_USER_LOOKUP_SERVICE_TOKEN,
  AUTH_JWT_MODULE_VERIFY_TOKEN_SERVICE_TOKEN,
} from './auth-jwt.constants';
import { AuthJwtSettingsInterface } from './interfaces/auth-jwt-settings.interface';

describe(AuthJwtModule, () => {
  const UserRepo = mock(Repository<UserEntityFixture>);
  const Manager = mock(EntityManager);

  const datasource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
  });
  const entityManager = new Manager(datasource);
  const userRepo = new UserRepo(UserEntityFixture, entityManager);

  const jwtAccessService = new NestJwtService();
  const jwtRefreshService = new NestJwtService();
  const jwtSignService = new JwtSignService(
    jwtAccessService,
    jwtRefreshService,
  );
  const jwtVerifyService = new JwtVerifyService(jwtSignService);

  let testModule: TestingModule;
  let authJwtModule: AuthJwtModule;
  let userLookupService: UserLookupService;
  let verifyTokenService: VerifyTokenService;

  describe(AuthJwtModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthJwtModule.forRoot({
            verifyTokenService: new VerifyTokenService(jwtVerifyService),
            userLookupService: new UserLookupService(userRepo),
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
            userLookupService: new UserLookupService(userRepo),
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
            inject: [VerifyTokenService, UserLookupService],
            useFactory: (
              verifyTokenService: VerifyTokenService,
              userLookupService: UserLookupService,
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
            inject: [VerifyTokenService, UserLookupService],
            useFactory: (
              verifyTokenService: VerifyTokenService,
              userLookupService: UserLookupService,
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
        public userLookupService: UserLookupServiceInterface,
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
    const ffUserLookupService = new UserLookupService(userRepo);
    const ffVerifyTokenService = new VerifyTokenService(jwtVerifyService);

    beforeEach(async () => {
      const globalModule = testModuleFactory([
        AuthJwtModule.forRootAsync({
          inject: [VerifyTokenService, UserLookupService],
          useFactory: (
            verifyTokenService: VerifyTokenService,
            userLookupService: UserLookupService,
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
    userLookupService = module.get(UserLookupService);
    verifyTokenService = module.get(VerifyTokenService);
  }

  function commonTests() {
    expect(authJwtModule).toBeInstanceOf(AuthJwtModule);
    expect(userLookupService).toBeInstanceOf(UserLookupService);
    expect(verifyTokenService).toBeInstanceOf(VerifyTokenService);
  }
});

function testModuleFactory(
  extraImports: DynamicModule['imports'] = [],
): ModuleMetadata {
  return {
    imports: [
      TypeOrmExtModule.register({
        type: 'sqlite',
        database: ':memory:',
        entities: [UserEntityFixture],
      }),
      AuthenticationModule.register({ global: true }),
      JwtModule.forRoot({}),
      CrudModule.forRoot({}),
      UserModule.register({
        entities: {
          user: {
            entity: UserEntityFixture,
          },
        },
      }),
      ...extraImports,
    ],
  };
}
