import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { LoggerTransportService } from '../logger-transport.service';
import { LoggerConfigOptions, LoggerModule } from '../logger.module';
import { loggerConfig } from './logger.config';
import { LoggerConfigInterface } from '../interfaces/logger-config.interface';

import { Severity as SentryLogSeverity } from '@sentry/types';

jest.mock('@sentry/node');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('loggerConfig', () => {
  let env: Record<string, string>;
  beforeEach(async () => {
    env = Object.assign({}, process.env);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('IsDefined', () => {
    it('was loggerConfig defined', async () => {
      expect(loggerConfig).toBeDefined();
    });
  });

  describe('Sentry Configuration', () => {
    it('was loggerSentryConfig defined', async () => {
      expect(loggerConfig().transportSentryConfig).toBeDefined();
    });

    /**
     * Check Dns
     *
     */
    it('loggerSentryConfig.dns', async () => {
      const env = Object.assign({}, process.env);
      process.env.SENTRY_DSN = 'SENTRY_DSN_MOCK';
      expect(loggerConfig().transportSentryConfig.dsn).toBe('SENTRY_DSN_MOCK');
      process.env = env;
    });

    // it('loggerSentryConfig.dns_null', async () => {
    //   const env = Object.assign({}, process.env);
    //   process.env.SENTRY_DSN = null;
    //   console.log('loggerConfig().transportSentryConfig.dsn', loggerConfig().transportSentryConfig?.dsn);
    //   expect(loggerConfig().transportSentryConfig?.dsn).toBeNull();
    //   process.env = env;
    // });

    it('loggerSentryConfig.dns_empty', async () => {
      const env = Object.assign({}, process.env);
      process.env = null;
      expect(loggerConfig().transportSentryConfig?.dsn).toBe('');
      process.env = env;
    });

    /**
     * Test check if Sentry init was called
     */
    it('loggerSentryConfig.logLevelMap', async () => {
      expect(loggerConfig().transportSentryConfig.logLevelMap('error')).toBe(
        SentryLogSeverity.Error,
      );
      expect(loggerConfig().transportSentryConfig.logLevelMap('debug')).toBe(
        SentryLogSeverity.Debug,
      );
      expect(loggerConfig().transportSentryConfig.logLevelMap('log')).toBe(SentryLogSeverity.Log);
      expect(loggerConfig().transportSentryConfig.logLevelMap('warn')).toBe(
        SentryLogSeverity.Warning,
      );
      expect(loggerConfig().transportSentryConfig.logLevelMap('verbose')).toBe(
        SentryLogSeverity.Info,
      );
      expect(loggerConfig().transportSentryConfig.logLevelMap(null)).toBe(undefined);
    });
  })

  /**
   * Test with no env
   *
   */
  it('loggerConfig.no_env', async () => {
    process.env = null;
    expect(loggerConfig().logLevel).toStrictEqual(['error']);
    expect(loggerConfig().transportLogLevel).toStrictEqual(['error']);
    process.env = env;
  });

  /**
   * Test with env empty
   *
   */
  it('loggerConfig.empty_env', async () => {
    process.env = {};
    expect(loggerConfig().logLevel).toStrictEqual(['error']);
    expect(loggerConfig().transportLogLevel).toStrictEqual(['error']);
    process.env = env;
  });

  /**
   * Test with multiple log level
   *
   */
  it('loggerConfig.multiple_logs', async () => {
    process.env.LOG_LEVEL = 'log,error';
    expect(loggerConfig().logLevel).toStrictEqual(['log', 'error']);
    expect(loggerConfig().transportLogLevel).toStrictEqual(['error']);
    process.env = env;
  });

  /**
   * Test with multiple log level and transport
   *
   */
  it('loggerConfig.multiple_logsNTransport', async () => {
    process.env.LOG_LEVEL = 'log,error';
    process.env.TRANSPORT_LOG_LEVEL = 'log,error';
    expect(loggerConfig().logLevel).toStrictEqual(['log', 'error']);
    expect(loggerConfig().transportLogLevel).toStrictEqual(['log', 'error']);
    process.env = env;
  });

  // it('Is Config defined', async () => {
  //   const moduleRef = await Test.createTestingModule({
  //     imports: [LoggerModule.forRoot({
  //       loggerConfig: loggerConfig
  //     })],
  //     providers: [],
  //   }).compile();

  //   const testConfigLogger = moduleRef.get(LoggerTransportService);

  //   expect(testConfigLogger['logLevels']).toStrictEqual(['error']);

  // });


  it('Is ForRoot defined', async () => {

    const loggerConfigOverwrite = {
      logLevel: ['warn'],
      transportLogLevel: ['warn'],
    } as LoggerConfigInterface;
    
    const moduleRef = await Test.createTestingModule({
      imports: [LoggerModule.forRoot({
        loggerConfig: loggerConfigOverwrite
      })],
      providers: [],
    }).compile();

    const testConfigLogger = moduleRef.get(LoggerTransportService);

    expect(testConfigLogger['logLevels']).toStrictEqual(['warn']);

  });

  it('Is ForRoot ASYNC defined', async () => {

    const loggerConfigOverwrite = {
      logLevel: ['debug'],
      transportLogLevel: ['debug'],
    } as LoggerConfigInterface;
    
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        LoggerModule.forRootAsync({
          useFactory: async (): Promise<LoggerConfigOptions> => {
            await delay(1000);
            return {
              loggerConfig: loggerConfigOverwrite
            };
          }
        })
      ],
      providers: [],
    }).compile();

    const testConfigLogger = moduleRef.get(LoggerTransportService);

    expect(testConfigLogger['logLevels']).toStrictEqual(['debug']);

  });
});
