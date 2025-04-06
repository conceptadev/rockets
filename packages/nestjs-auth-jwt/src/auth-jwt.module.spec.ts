import { mock } from 'jest-mock-extended';
import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtVerifyTokenService } from '@concepta/nestjs-jwt';
import {
  AuthenticationModule,
  VerifyTokenService,
} from '@concepta/nestjs-authentication';

import { AuthJwtUserLookupService } from './auth-jwt.constants';

import { AuthJwtModule } from './auth-jwt.module';
import { AuthJwtUserLookupServiceInterface } from './interfaces/auth-jwt-user-lookup-service.interface';

import { UserModuleFixture } from './__fixtures__/user/user.module.fixture';
import { UserLookupServiceFixture } from './__fixtures__/user/user-lookup.service.fixture';

describe(AuthJwtModule, () => {
  const jwtVerifyTokenService = mock<JwtVerifyTokenService>();

  let testModule: TestingModule;
  let authJwtModule: AuthJwtModule;
  let userLookupService: AuthJwtUserLookupServiceInterface;
  let verifyTokenService: VerifyTokenService;

  describe(AuthJwtModule.forRoot, () => {
    beforeEach(async () => {
      testModule = await Test.createTestingModule(
        testModuleFactory([
          AuthJwtModule.forRoot({
            verifyTokenService: new VerifyTokenService(jwtVerifyTokenService),
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
            verifyTokenService: new VerifyTokenService(jwtVerifyTokenService),
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

  function commonVars(module: TestingModule) {
    authJwtModule = module.get(AuthJwtModule);
    userLookupService = module.get(AuthJwtUserLookupService);
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
