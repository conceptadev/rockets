import {
  ConfigFactory,
  ConfigFactoryKeyHost,
  registerAs,
} from '@nestjs/config';

import { LogLevel } from '@nestjs/common';
import { Severity as SentryLogSeverity } from '@sentry/types';

import { LoggerSentrySettingsInterface } from '../interfaces/logger-sentry-settings.interface';
import { splitLogLevel } from '@concepta/nestjs-logger';

/**
 * The token to which all logger-sentry module settings are set.
 */
export const LOGGER_SENTRY_MODULE_SETTINGS_TOKEN = 'LOGGER_SENTRY_MODULE_SETTINGS_TOKEN';


/**
 * LoggerSentry config factory type.
 */
export type LoggerSentryConfigFactory = ConfigFactory<LoggerSentrySettingsInterface> &
  ConfigFactoryKeyHost;

/**
 * Configuration for LoggerSentry.
 *
 * ### example
 * ```ts
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot({logLevel: ['warn', 'error']})
 *   ],
 *  ...
 * })
 * ```
 */
export const loggerSentryConfig: (() => LoggerSentrySettingsInterface) &
  ConfigFactoryKeyHost<ReturnType<() => LoggerSentrySettingsInterface>> = registerAs(
  'LOGGER_SENTRY_MODULE_DEFAULT_CONFIG',
  (): LoggerSentrySettingsInterface => ({
    /**
     * Get log levels from environment variables
     */
    logLevel:
      'SENTRY_LOG_LEVEL' in process.env && process.env.SENTRY_LOG_LEVEL
        ? splitLogLevel(process.env.SENTRY_LOG_LEVEL)
        : ['error'],

    transportConfig: {
      /**
       * Sentry DNS
       */
      dsn:
        'SENTRY_DSN' in process.env && process.env.SENTRY_DSN
          ? process.env.SENTRY_DSN
          : '',

      /**
       * Mapping from log level to sentry severity
       *
       * @param logLevel
       * @returns SentryLogSeverity
       */
      logLevelMap: (logLevel: LogLevel): SentryLogSeverity => {
        switch (logLevel) {
          case 'error':
            return SentryLogSeverity.Error;
          case 'debug':
            return SentryLogSeverity.Debug;
          case 'log':
            return SentryLogSeverity.Log;
          case 'warn':
            return SentryLogSeverity.Warning;
          case 'verbose':
            return SentryLogSeverity.Info;
        }
      },
    },
  }),
);
