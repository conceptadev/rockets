import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  JwtIssueTokenService,
  JwtModule,
  JwtService,
  JwtVerifyTokenService,
} from '@concepta/nestjs-jwt';
import {
  AuthenticationModule,
  IssueTokenService,
  IssueTokenServiceInterface,
  VerifyTokenService,
  VerifyTokenServiceInterface,
} from '@concepta/nestjs-authentication';

import { AuthRefreshUserModelServiceInterface } from './interfaces/auth-refresh-user-model-service.interface';
import { AuthRefreshModule } from './auth-refresh.module';

import { UserModelServiceFixture } from './__fixtures__/user/user-model.service.fixture';
import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';

describe(AuthRefreshModule, () => {
  const jwtService = new JwtService();
  const jwtVerifyTokenService = new JwtVerifyTokenService(
    jwtService,
    jwtService,
  );
  const jwtIssueTokenService = new JwtIssueTokenService(jwtService, jwtService);

  let testModule: TestingModule;
  let authRefreshModule: AuthRefreshModule;
  let userModelService: AuthRefreshUserModelServiceInterface;
  let issueTokenService: IssueTokenServiceInterface;
  let verifyTokenService: VerifyTokenServiceInterface;

  describe(AuthRefreshModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthRefreshModule.forRoot({
            verifyTokenService: new VerifyTokenService(jwtVerifyTokenService),
            issueTokenService: new IssueTokenService(jwtIssueTokenService),
            userModelService: new UserModelServiceFixture(),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars(testModule);
      commonTests();
    });
  });

  describe(AuthRefreshModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthRefreshModule.register({
            verifyTokenService: new VerifyTokenService(jwtVerifyTokenService),
            issueTokenService: new IssueTokenService(jwtIssueTokenService),
            userModelService: new UserModelServiceFixture(),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars(testModule);
      commonTests();
    });
  });

  describe(AuthRefreshModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthRefreshModule.forRootAsync({
            inject: [
              VerifyTokenService,
              IssueTokenService,
              UserModelServiceFixture,
            ],
            useFactory: (
              verifyTokenService: VerifyTokenService,
              issueTokenService: IssueTokenServiceInterface,
              userModelService: AuthRefreshUserModelServiceInterface,
            ) => ({
              verifyTokenService,
              issueTokenService,
              userModelService: userModelService,
            }),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars(testModule);
      commonTests();
    });
  });

  describe(AuthRefreshModule.registerAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthRefreshModule.registerAsync({
            inject: [
              VerifyTokenService,
              IssueTokenService,
              UserModelServiceFixture,
            ],
            useFactory: (
              verifyTokenService: VerifyTokenService,
              issueTokenService: IssueTokenService,
              userModelService: AuthRefreshUserModelServiceInterface,
            ) => ({
              verifyTokenService,
              issueTokenService,
              userModelService: userModelService,
            }),
          }),
        ]),
      ).compile();
    });

    it('module should be loaded', async () => {
      commonVars(testModule);
      commonTests();
    });
  });

  function commonVars(module: TestingModule) {
    authRefreshModule = module.get(AuthRefreshModule);
    userModelService = module.get(UserModelServiceFixture);
    verifyTokenService = module.get(VerifyTokenService);
    issueTokenService = module.get(IssueTokenService);
  }

  function commonTests() {
    expect(authRefreshModule).toBeInstanceOf(AuthRefreshModule);
    expect(userModelService).toBeInstanceOf(UserModelServiceFixture);
    expect(issueTokenService).toBeInstanceOf(IssueTokenService);
    expect(verifyTokenService).toBeInstanceOf(VerifyTokenService);
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
