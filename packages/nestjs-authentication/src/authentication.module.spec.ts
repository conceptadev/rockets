import { DynamicModule, ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtModule } from '@concepta/nestjs-jwt';

import { IssueTokenServiceInterface } from './interfaces/issue-token-service.interface';
import { VerifyTokenServiceInterface } from './interfaces/verify-token-service.interface';
import { ValidateTokenServiceInterface } from './interfaces/validate-token-service.interface';

import { AuthenticationModule } from './authentication.module';
import { ValidateTokenService } from './authentication.constants';
import { VerifyTokenService } from './services/verify-token.service';
import { IssueTokenService } from './services/issue-token.service';

import { GlobalModuleFixture } from './__fixtures__/global.module.fixture';
import { ValidateTokenServiceFixture } from './__fixtures__/services/validate-token.service.fixture';
import { VerifyTokenServiceFixture } from './__fixtures__/services/verify-token.service.fixture';
import { IssueTokenServiceFixture } from './__fixtures__/services/issue-token.service.fixture';

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

  function commonVars() {
    authenticationModule = testModule.get(AuthenticationModule);
    verifyTokenService = testModule.get(VerifyTokenService);
    issueTokenService = testModule.get(IssueTokenService);
    validateTokenService = testModule.get(ValidateTokenService);
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
