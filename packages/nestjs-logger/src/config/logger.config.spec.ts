import { ConfigModule } from '@nestjs/config';
import { LoggerOptionsInterface } from '../interfaces/logger-options.interface';
import { Severity as SentryLogSeverity } from '@sentry/types';
import { Test, TestingModule } from '@nestjs/testing';
import { loggerConfig, LOGGER_MODULE_OPTIONS_TOKEN } from './logger.config';
import { LogLevel } from '@nestjs/common';

jest.mock('@sentry/node');

describe('logger configuration', () => {
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
      expect(LOGGER_MODULE_OPTIONS_TOKEN).toEqual('LOGGER_MODULE_OPTIONS');
    });
  });

  describe('loggerConfig()', () => {
    let moduleRef: TestingModule;

    it('should use fallbacks', async () => {
      moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forFeature(loggerConfig)],
        providers: [],
      }).compile();

      const config: LoggerOptionsInterface =
        moduleRef.get<LoggerOptionsInterface>(loggerConfig.KEY);

      expect(config).toMatchObject({
        logLevel: ['error'],
        transportLogLevel: ['error'],
        transportSentryConfig: { dsn: '', logLevelMap: expect.any(Function) },
      });
    });

    it('should use envs', async () => {
      process.env.LOG_LEVEL = 'debug,warn';
      process.env.TRANSPORT_LOG_LEVEL = 'debug,warn';
      process.env.SENTRY_DSN = 'http://fake.url';

      moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forFeature(loggerConfig)],
        providers: [],
      }).compile();

      const config: LoggerOptionsInterface =
        moduleRef.get<LoggerOptionsInterface>(loggerConfig.KEY);

      expect(config).toMatchObject({
        logLevel: ['debug', 'warn'],
        transportLogLevel: ['debug', 'warn'],
        transportSentryConfig: {
          dsn: 'http://fake.url',
          logLevelMap: expect.any(Function),
        },
      });
    });

    describe('log level map', () => {
      it('loggerSentryConfig.logLevelMap', async () => {
        const config = await loggerConfig();

        if (config && config.transportSentryConfig) {
          expect(config.transportSentryConfig.logLevelMap('error')).toBe(
            SentryLogSeverity.Error,
          );
          expect(config.transportSentryConfig.logLevelMap('debug')).toBe(
            SentryLogSeverity.Debug,
          );
          expect(config.transportSentryConfig.logLevelMap('log')).toBe(
            SentryLogSeverity.Log,
          );
          expect(config.transportSentryConfig.logLevelMap('warn')).toBe(
            SentryLogSeverity.Warning,
          );
          expect(config.transportSentryConfig.logLevelMap('verbose')).toBe(
            SentryLogSeverity.Info,
          );
          expect(
            config.transportSentryConfig.logLevelMap(
              null as unknown as LogLevel,
            ),
          ).toBe(undefined);
        } else {
          throw new Error('loggerConfig is not defined');
        }
      });
    });
  });
});
