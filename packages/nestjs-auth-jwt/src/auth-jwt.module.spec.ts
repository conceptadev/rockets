import { mock } from 'jest-mock-extended';
import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtVerifyTokenService } from '@concepta/nestjs-jwt';
import {
  AuthenticationModule,
  VerifyTokenService,
} from '@concepta/nestjs-authentication';

import { AuthJwtUserModelService } from './auth-jwt.constants';

import { AuthJwtModule } from './auth-jwt.module';
import { AuthJwtUserModelServiceInterface } from './interfaces/auth-jwt-user-model-service.interface';

import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';
import { UserModelServiceFixture } from './__fixtures__/user/user-model.service.fixture';

describe(AuthJwtModule, () => {
  const jwtVerifyTokenService = mock<JwtVerifyTokenService>();

  let testModule: TestingModule;
  let authJwtModule: AuthJwtModule;
  let userModelService: AuthJwtUserModelServiceInterface;
  let verifyTokenService: VerifyTokenService;

  describe(AuthJwtModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthJwtModule.forRoot({
            verifyTokenService: new VerifyTokenService(jwtVerifyTokenService),
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

  describe(AuthJwtModule.register, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthJwtModule.register({
            verifyTokenService: new VerifyTokenService(jwtVerifyTokenService),
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

  describe(AuthJwtModule.forRootAsync, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthJwtModule.forRootAsync({
            inject: [VerifyTokenService, UserModelServiceFixture],
            useFactory: (
              verifyTokenService: VerifyTokenService,
              userModelService: AuthJwtUserModelServiceInterface,
            ) => ({ verifyTokenService, userModelService }),
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
            inject: [VerifyTokenService, UserModelServiceFixture],
            useFactory: (
              verifyTokenService: VerifyTokenService,
              userModelService: UserModelServiceFixture,
            ) => ({ verifyTokenService, userModelService }),
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
    authJwtModule = module.get(AuthJwtModule);
    userModelService = module.get(AuthJwtUserModelService);
    verifyTokenService = module.get(VerifyTokenService);
  }

  function commonTests() {
    expect(authJwtModule).toBeInstanceOf(AuthJwtModule);
    expect(userModelService).toBeInstanceOf(UserModelServiceFixture);
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
