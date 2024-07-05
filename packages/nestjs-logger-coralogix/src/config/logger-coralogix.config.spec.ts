import { ConfigModule } from '@nestjs/config';
import { CoralogixOptionsInterface } from '../interfaces/logger-coralogix-options.interface';
import { Test, TestingModule } from '@nestjs/testing';

import { coralogixConfig, LOGGER_CORALOGIX_MODULE_SETTINGS_TOKEN } from './logger-coralogix.config';

jest.mock('@sentry/node');

describe('coralogix configuration', () => {
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
      expect(LOGGER_CORALOGIX_MODULE_SETTINGS_TOKEN).toEqual(
        'LOGGER_CORALOGIX_MODULE_SETTINGS_TOKEN',
      );
    });
  });

  describe('coralogixConfig()', () => {
    let moduleRef: TestingModule;

    it('should use fallbacks', async () => {
      moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forFeature(coralogixConfig)],
        providers: [],
      }).compile();

      const config: CoralogixOptionsInterface =
        moduleRef.get<CoralogixOptionsInterface>(coralogixConfig.KEY);

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
        imports: [ConfigModule.forFeature(coralogixConfig)],
        providers: [],
      }).compile();

      const config: CoralogixOptionsInterface =
        moduleRef.get<CoralogixOptionsInterface>(coralogixConfig.KEY);

      expect(config).toMatchObject({
        logLevel: ['debug', 'warn'],
        transportLogLevel: ['debug', 'warn'],
        transportSentryConfig: {
          dsn: 'http://fake.url',
          logLevelMap: expect.any(Function),
        },
      });
    });

  });
});
