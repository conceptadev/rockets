import { Test, TestingModule } from '@nestjs/testing';

import { JwtModule } from './jwt.module';
import { JwtService } from './services/jwt.service';
import { JwtVerifyTokenService } from './services/jwt-verify-token.service';
import { JwtIssueTokenService } from './services/jwt-issue-token.service';
import { JwtSettingsInterface } from './interfaces/jwt-settings.interface';
import {
  JWT_MODULE_SETTINGS_TOKEN,
  JwtAccessService,
  JwtRefreshService,
} from './jwt.constants';

describe(JwtModule, () => {
  let jwtModule: JwtModule;
  let jwtSettings: JwtSettingsInterface;
  let jwtService: JwtService;
  let jwtAccessService: JwtService;
  let jwtRefreshService: JwtService;
  let jwtIssueTokenService: JwtIssueTokenService;
  let jwtVerifyTokenService: JwtVerifyTokenService;

  describe(JwtModule.register, () => {
    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [JwtModule.register({})],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(JwtModule.forRoot, () => {
    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [JwtModule.forRoot({})],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(JwtModule.registerAsync, () => {
    beforeEach(async () => {
      const testModule = await Test.createTestingModule({
        imports: [JwtModule.registerAsync({ useFactory: () => ({}) })],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(JwtModule.forRootAsync, () => {
    beforeEach(async () => {
      const testModule = await Test.createTestingModule({
        imports: [JwtModule.forRootAsync({ useFactory: () => ({}) })],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  function setProviderVars(testModule: TestingModule) {
    jwtModule = testModule.get<JwtModule>(JwtModule);
    jwtSettings = testModule.get<JwtSettingsInterface>(
      JWT_MODULE_SETTINGS_TOKEN,
    );
    jwtService = testModule.get<JwtService>(JwtService);
    jwtAccessService = testModule.get<JwtService>(JwtAccessService);
    jwtRefreshService = testModule.get<JwtService>(JwtRefreshService);
    jwtIssueTokenService =
      testModule.get<JwtIssueTokenService>(JwtIssueTokenService);
    jwtVerifyTokenService = testModule.get<JwtVerifyTokenService>(
      JwtVerifyTokenService,
    );
  }

  function commonProviderTests() {
    it('providers should be loaded', async () => {
      expect(jwtModule).toBeInstanceOf(JwtModule);
      expect(jwtSettings).toBeInstanceOf(Object);
      expect(jwtService).toBeInstanceOf(JwtService);
      expect(jwtAccessService).toBeInstanceOf(JwtService);
      expect(jwtRefreshService).toBeInstanceOf(JwtService);
      expect(jwtIssueTokenService).toBeInstanceOf(JwtIssueTokenService);
      expect(jwtVerifyTokenService).toBeInstanceOf(JwtVerifyTokenService);
    });
  }
});
