import { ConfigModule } from '@nestjs/config';
import { Severity as SentryLogSeverity } from '@sentry/types';
import { Test, TestingModule } from '@nestjs/testing';

import {
  loggerSentryConfig,
  LOGGER_SENTRY_MODULE_SETTINGS_TOKEN,
} from './logger-sentry.config';

jest.mock('@sentry/node');

describe('logger-sentry configuration', () => {
  let envOriginal: NodeJS.ProcessEnv;

  beforeEach(async () => {
    envOriginal = process.env;
  });

  afterEach(async () => {
    process.env = envOriginal;
    jest.clearAllMocks();
  });

  describe('options token', () => {
    it('should be defined', async () => {
      expect(LOGGER_SENTRY_MODULE_SETTINGS_TOKEN).toEqual(
        'LOGGER_SENTRY_MODULE_SETTINGS_TOKEN',
      );
    });
  });

  describe('loggerConfig()', () => {
    let moduleRef: TestingModule;

    it('should use fallbacks', async () => {
      moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forFeature(loggerSentryConfig)],
        providers: [],
      }).compile();

      const config = moduleRef.get(loggerSentryConfig.KEY);

      expect(config).toMatchObject({
        logLevel: ['error'],
        transportConfig: { dsn: '', logLevelMap: expect.any(Function) },
      });
    });

    it('should use envs', async () => {
      process.env.SENTRY_LOG_LEVEL = 'debug,warn';
      process.env.SENTRY_DSN = 'http://fake.url';

      moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forFeature(loggerSentryConfig)],
        providers: [],
      }).compile();

      const config = moduleRef.get(loggerSentryConfig.KEY);

      expect(config).toMatchObject({
        logLevel: ['debug', 'warn'],
        transportConfig: {
          dsn: 'http://fake.url',
          logLevelMap: expect.any(Function),
        },
      });
    });

    describe('log level map', () => {
      it('loggerSentryConfig.logLevelMap', async () => {
        const config = await loggerSentryConfig();

        if (config && config.transportConfig) {
          expect(config.transportConfig.logLevelMap('error')).toBe(
            SentryLogSeverity.Error,
          );
          expect(config.transportConfig.logLevelMap('debug')).toBe(
            SentryLogSeverity.Debug,
          );
          expect(config.transportConfig.logLevelMap('log')).toBe(
            SentryLogSeverity.Log,
          );
          expect(config.transportConfig.logLevelMap('warn')).toBe(
            SentryLogSeverity.Warning,
          );
          expect(config.transportConfig.logLevelMap('verbose')).toBe(
            SentryLogSeverity.Info,
          );
        } else {
          throw new Error('loggerConfig is not defined');
        }
      });
    });
  });
});
