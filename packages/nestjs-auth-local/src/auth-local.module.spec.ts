import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  JwtIssueTokenService,
  JwtModule,
  JwtService,
} from '@concepta/nestjs-jwt';
import {
  AuthenticationModule,
  IssueTokenService,
  IssueTokenServiceInterface,
} from '@concepta/nestjs-authentication';
import {
  PasswordValidationService,
  PasswordValidationServiceInterface,
} from '@concepta/nestjs-password';

import { AuthLocalModule } from './auth-local.module';
import { AuthLocalUserModelServiceInterface } from './interfaces/auth-local-user-model-service.interface';
import { AuthLocalValidateUserServiceInterface } from './interfaces/auth-local-validate-user-service.interface';

import { UserModelServiceFixture } from './__fixtures__/user/user-model.service.fixture';
import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';
import { AuthLocalValidateUserService } from './services/auth-local-validate-user.service';

describe(AuthLocalModule, () => {
  const jwtService = new JwtService();
  const jwtIssueTokenService = new JwtIssueTokenService(jwtService, jwtService);

  let testModule: TestingModule;
  let authLocalModule: AuthLocalModule;
  let userModelService: AuthLocalUserModelServiceInterface;
  let validateUserService: AuthLocalValidateUserServiceInterface;
  let issueTokenService: IssueTokenServiceInterface;
  let passwordValidationService: PasswordValidationServiceInterface;

  describe(AuthLocalModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthLocalModule.forRoot({
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

  describe(AuthLocalModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthLocalModule.register({
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

  describe(AuthLocalModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthLocalModule.forRootAsync({
            inject: [IssueTokenService, UserModelServiceFixture],
            useFactory: (
              issueTokenService: IssueTokenServiceInterface,
              userModelService: AuthLocalUserModelServiceInterface,
            ) => ({ issueTokenService, userModelService }),
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
            inject: [IssueTokenService, UserModelServiceFixture],
            useFactory: (
              issueTokenService: IssueTokenService,
              userModelService: AuthLocalUserModelServiceInterface,
            ) => ({ issueTokenService, userModelService }),
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
    authLocalModule = module.get(AuthLocalModule);
    userModelService = module.get(UserModelServiceFixture);
    validateUserService = module.get(AuthLocalValidateUserService);
    issueTokenService = module.get(IssueTokenService);
    passwordValidationService = module.get(PasswordValidationService);
  }

  function commonTests() {
    expect(authLocalModule).toBeInstanceOf(AuthLocalModule);
    expect(userModelService).toBeInstanceOf(UserModelServiceFixture);
    expect(issueTokenService).toBeInstanceOf(IssueTokenService);
    expect(passwordValidationService).toBeInstanceOf(PasswordValidationService);
    expect(validateUserService).toBeInstanceOf(AuthLocalValidateUserService);
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
