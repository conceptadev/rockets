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

import { AuthRefreshUserLookupServiceInterface } from './interfaces/auth-refresh-user-lookup-service.interface';
import { AuthRefreshModule } from './auth-refresh.module';

import { UserLookupServiceFixture } from './__fixtures__/user/user-lookup.service.fixture';
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
  let userLookupService: AuthRefreshUserLookupServiceInterface;
  let issueTokenService: IssueTokenServiceInterface;
  let verifyTokenService: VerifyTokenServiceInterface;

  describe(AuthRefreshModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthRefreshModule.forRoot({
            verifyTokenService: new VerifyTokenService(jwtVerifyTokenService),
            issueTokenService: new IssueTokenService(jwtIssueTokenService),
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

  describe(AuthRefreshModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthRefreshModule.register({
            verifyTokenService: new VerifyTokenService(jwtVerifyTokenService),
            issueTokenService: new IssueTokenService(jwtIssueTokenService),
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

  describe(AuthRefreshModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthRefreshModule.forRootAsync({
            inject: [
              VerifyTokenService,
              IssueTokenService,
              UserLookupServiceFixture,
            ],
            useFactory: (
              verifyTokenService: VerifyTokenService,
              issueTokenService: IssueTokenServiceInterface,
              userLookupService: AuthRefreshUserLookupServiceInterface,
            ) => ({ verifyTokenService, issueTokenService, userLookupService }),
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
              UserLookupServiceFixture,
            ],
            useFactory: (
              verifyTokenService: VerifyTokenService,
              issueTokenService: IssueTokenService,
              userLookupService: AuthRefreshUserLookupServiceInterface,
            ) => ({ verifyTokenService, issueTokenService, userLookupService }),
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
    userLookupService = module.get(UserLookupServiceFixture);
    verifyTokenService = module.get(VerifyTokenService);
    issueTokenService = module.get(IssueTokenService);
  }

  function commonTests() {
    expect(authRefreshModule).toBeInstanceOf(AuthRefreshModule);
    expect(userLookupService).toBeInstanceOf(UserLookupServiceFixture);
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
