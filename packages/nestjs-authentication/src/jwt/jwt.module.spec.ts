import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtModule } from './jwt.module';
import { JwtService } from './services/jwt.service';
import { JwtVerifyTokenService } from './services/jwt-verify-token.service';
import { JwtIssueTokenService } from './services/jwt-issue-token.service';
import { JwtSettingsInterface } from './interfaces/jwt-settings.interface';
import {
  JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
  JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
  JWT_MODULE_SETTINGS_TOKEN,
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

  describe(JwtModule.forFeature, () => {
    @Module({
      imports: [JwtModule.forRoot({})],
    })
    class AppGlobalTest {}

    @Module({
      imports: [AppGlobalTest, JwtModule.forFeature({})],
    })
    class AppFeatureTest {}

    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [AppFeatureTest],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(JwtModule.forFeature, () => {
    @Module({
      imports: [JwtModule.forRoot({})],
    })
    class AppGlobalTest {}

    @Injectable()
    class JwtAccessServiceFixture extends JwtService {}

    @Injectable()
    class JwtRefreshServiceFixture extends JwtService {}

    @Injectable()
    class JwtServiceFixture extends JwtService {}

    @Injectable()
    class JwtIssueServiceFixture extends JwtIssueTokenService {}

    @Injectable()
    class JwtVerifyServiceFixture extends JwtVerifyTokenService {}

    const jwtAccessServiceFixture = new JwtAccessServiceFixture({
      secret: 'bar1',
    });

    const jwtRefreshServiceFixture = new JwtRefreshServiceFixture({
      secret: 'bar2',
    });

    const jwtServiceFixture = new JwtServiceFixture();

    const jwtIssueServiceFixture = new JwtIssueServiceFixture(
      jwtServiceFixture,
      jwtServiceFixture,
    );

    const jwtVerifyServiceFixture = new JwtVerifyServiceFixture(
      jwtServiceFixture,
      jwtServiceFixture,
    );

    @Module({
      imports: [
        AppGlobalTest,
        JwtModule.register({
          settings: { access: { secret: 'foo1' }, refresh: { secret: 'foo2' } },
          jwtAccessService: jwtAccessServiceFixture,
          jwtRefreshService: jwtRefreshServiceFixture,
          jwtService: jwtServiceFixture,
          jwtIssueTokenService: jwtIssueServiceFixture,
          jwtVerifyTokenService: jwtVerifyServiceFixture,
        }),
      ],
    })
    class AppFeatureTest {}

    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [AppFeatureTest],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();

    it('providers should be correct', async () => {
      expect(jwtService).toEqual(jwtServiceFixture);
      expect(jwtIssueTokenService).toEqual(jwtIssueServiceFixture);
      expect(jwtIssueTokenService['jwtAccessService']).toEqual(
        jwtServiceFixture,
      );
      expect(jwtIssueTokenService['jwtRefreshService']).toEqual(
        jwtServiceFixture,
      );
      expect(jwtVerifyTokenService).toBe(jwtVerifyServiceFixture);
      expect(jwtVerifyTokenService['jwtAccessService']).toEqual(
        jwtServiceFixture,
      );
      expect(jwtVerifyTokenService['jwtRefreshService']).toEqual(
        jwtServiceFixture,
      );
    });

    it('settings should be overriden', async () => {
      expect(jwtSettings).toEqual({
        access: { secret: 'foo1' },
        refresh: { secret: 'foo2' },
      });
      expect(jwtAccessService['options'].secret).toEqual('bar1');
      expect(jwtRefreshService['options'].secret).toEqual('bar2');
    });
  });

  function setProviderVars(testModule: TestingModule) {
    jwtModule = testModule.get<JwtModule>(JwtModule);
    jwtSettings = testModule.get<JwtSettingsInterface>(
      JWT_MODULE_SETTINGS_TOKEN,
    );
    jwtService = testModule.get<JwtService>(JwtService);
    jwtAccessService = testModule.get<JwtService>(
      JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
    );
    jwtRefreshService = testModule.get<JwtService>(
      JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
    );
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
