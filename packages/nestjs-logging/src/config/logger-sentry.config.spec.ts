import { Severity as SentryLogSeverity } from '@sentry/types';

import { loggerSentryConfig } from '../config/logger-sentry.config';

jest.mock('@sentry/node');

describe('loggerSentryConfig', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('IsDefined', () => {
    it('was loggerSentryConfig defined', async () => {
      expect(loggerSentryConfig).toBeDefined();
    });
  });

  /**
   * Check Dns
   *
   */
  it('loggerSentryConfig.dns', async () => {
    const env = Object.assign({}, process.env);
    process.env.SENTRY_DSN = 'SENTRY_DSN_MOCK';
    expect(loggerSentryConfig().dsn).toBe('SENTRY_DSN_MOCK');
    process.env = env;
  });

  it('loggerSentryConfig.dns', async () => {
    const env = Object.assign({}, process.env);
    process.env.SENTRY_DSN = null;
    expect(loggerSentryConfig().dsn).toBe('');
    process.env = env;
  });

  it('loggerSentryConfig.dns_empty', async () => {
    const env = Object.assign({}, process.env);
    process.env = null;
    expect(loggerSentryConfig().dsn).toBe('');
    process.env = env;
  });

  /**
   * Test check if Sentry init was called
   */
  it('loggerSentryConfig.logLevelMap', async () => {
    expect(loggerSentryConfig().logLevelMap('error')).toBe(
      SentryLogSeverity.Error,
    );
    expect(loggerSentryConfig().logLevelMap('debug')).toBe(
      SentryLogSeverity.Debug,
    );
    expect(loggerSentryConfig().logLevelMap('log')).toBe(SentryLogSeverity.Log);
    expect(loggerSentryConfig().logLevelMap('warn')).toBe(
      SentryLogSeverity.Warning,
    );
    expect(loggerSentryConfig().logLevelMap('verbose')).toBe(
      SentryLogSeverity.Info,
    );
    expect(loggerSentryConfig().logLevelMap(null)).toBe(undefined);
  });
});
