import { Test, TestingModule } from '@nestjs/testing';

import { JwtModule } from './jwt.module';
import { JwtSignService } from './services/jwt-sign.service';
import { JwtVerifyService } from './services/jwt-verify.service';
import { JwtIssueService } from './services/jwt-issue.service';
import {
  JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
  JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
  JWT_MODULE_SETTINGS_TOKEN,
} from './jwt.constants';
import { JwtSettingsInterface } from './interfaces/jwt-settings.interface';
import { Injectable, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe(JwtModule, () => {
  let jwtModule: JwtModule;
  let jwtSettings: JwtSettingsInterface;
  let jwtAccessService: JwtService;
  let jwtRefreshService: JwtService;
  let jwtSignService: JwtSignService;
  let jwtIssueService: JwtIssueService;
  let jwtVerifyService: JwtVerifyService;

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
    class JwtSignServiceFixture extends JwtSignService {}

    @Injectable()
    class JwtIssueServiceFixture extends JwtIssueService {}

    @Injectable()
    class JwtVerifyServiceFixture extends JwtVerifyService {}

    const jwtAccessServiceFixture = new JwtAccessServiceFixture({
      secret: 'bar1',
    });

    const jwtRefreshServiceFixture = new JwtRefreshServiceFixture({
      secret: 'bar2',
    });

    const jwtSignServiceFixture = new JwtSignServiceFixture(
      jwtAccessServiceFixture,
      jwtRefreshServiceFixture,
    );

    const jwtIssueServiceFixture = new JwtIssueServiceFixture(
      jwtSignServiceFixture,
    );

    const jwtVerifyServiceFixture = new JwtVerifyServiceFixture(
      jwtSignServiceFixture,
    );

    @Module({
      imports: [
        AppGlobalTest,
        JwtModule.forFeature({
          settings: { access: { secret: 'foo1' }, refresh: { secret: 'foo2' } },
          jwtAccessService: jwtAccessServiceFixture,
          jwtRefreshService: jwtRefreshServiceFixture,
          jwtSignService: jwtSignServiceFixture,
          jwtIssueService: jwtIssueServiceFixture,
          jwtVerifyService: jwtVerifyServiceFixture,
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

    it('providers should be overridden', async () => {
      expect(jwtAccessService).toBe(jwtAccessServiceFixture);
      expect(jwtRefreshService).toBe(jwtRefreshServiceFixture);
      expect(jwtSignService).toBe(jwtSignServiceFixture);
      expect(jwtSignService['jwtAccessService']).toBe(jwtAccessServiceFixture);
      expect(jwtSignService['jwtRefreshService']).toBe(
        jwtRefreshServiceFixture,
      );
      expect(jwtIssueService).toBe(jwtIssueServiceFixture);
      expect(jwtIssueService['jwtSignService']).toBe(jwtSignService);
      expect(jwtVerifyService).toBe(jwtVerifyServiceFixture);
      expect(jwtVerifyService['jwtSignService']).toBe(jwtSignService);
    });

    it('settings should be overriden', async () => {
      expect(jwtSettings).toEqual({
        access: { secret: 'foo1' },
        refresh: { secret: 'foo2' },
      });
      expect(jwtAccessService['options'].secret).toEqual('bar1');
      expect(jwtRefreshService['options'].secret).toEqual('bar2');
      expect(jwtSignService['jwtAccessService']['options'].secret).toEqual(
        'bar1',
      );
      expect(jwtSignService['jwtRefreshService']['options'].secret).toEqual(
        'bar2',
      );
    });
  });

  function setProviderVars(testModule: TestingModule) {
    jwtModule = testModule.get<JwtModule>(JwtModule);
    jwtSettings = testModule.get<JwtSettingsInterface>(
      JWT_MODULE_SETTINGS_TOKEN,
    );
    jwtAccessService = testModule.get<JwtService>(
      JWT_MODULE_JWT_ACCESS_SERVICE_TOKEN,
    );
    jwtRefreshService = testModule.get<JwtService>(
      JWT_MODULE_JWT_REFRESH_SERVICE_TOKEN,
    );
    jwtSignService = testModule.get<JwtSignService>(JwtSignService);
    jwtIssueService = testModule.get<JwtIssueService>(JwtIssueService);
    jwtVerifyService = testModule.get<JwtVerifyService>(JwtVerifyService);
  }

  function commonProviderTests() {
    it('providers should be loaded', async () => {
      expect(jwtModule).toBeInstanceOf(JwtModule);
      expect(jwtSettings).toBeInstanceOf(Object);
      expect(jwtAccessService).toBeInstanceOf(JwtService);
      expect(jwtRefreshService).toBeInstanceOf(JwtService);
      expect(jwtSignService).toBeInstanceOf(JwtSignService);
      expect(jwtIssueService).toBeInstanceOf(JwtIssueService);
      expect(jwtVerifyService).toBeInstanceOf(JwtVerifyService);
    });
  }
});
