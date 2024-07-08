import {
  ConfigFactory,
  ConfigFactoryKeyHost,
  registerAs,
} from '@nestjs/config';

import { LogLevel } from '@nestjs/common';
import { Severity as SentryLogSeverity } from '@sentry/types';
import { splitLogLevel } from '../utils/config-parser.util';
import { LoggerSettingsInterface } from '../interfaces/logger-settings.interface';

/**
 * The token to which all logger module settings are set.
 */
export const LOGGER_MODULE_SETTINGS_TOKEN = 'LOGGER_MODULE_SETTINGS_TOKEN';

/**
 * Valid log levels.
 */
export const LOGGER_VALID_LOG_LEVELS: LogLevel[] = [
  'verbose',
  'debug',
  'log',
  'warn',
  'error',
];

/**
 * Logger config factory type.
 */
export type LoggerConfigFactory = ConfigFactory<LoggerSettingsInterface> &
  ConfigFactoryKeyHost;

/**
 * Configuration for Logger.
 *
 * @example
 * ```ts
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot({logLevel: ['warn', 'error']})
 *   ],
 *  ...
 * })
 * ```
 */
export const loggerConfig: (() => LoggerSettingsInterface) &
  ConfigFactoryKeyHost<ReturnType<() => LoggerSettingsInterface>> = registerAs(
  'LOGGER_MODULE_DEFAULT_CONFIG',
  (): LoggerSettingsInterface => ({
    /**
     * Get log levels from environment variables
     */
    logLevel:
      'LOG_LEVEL' in process.env && process.env.LOG_LEVEL
        ? splitLogLevel(process.env.LOG_LEVEL)
        : ['error'],

    /**
     * Get transport log levels from environment variables
     */
    transportLogLevel:
      'TRANSPORT_LOG_LEVEL' in process.env && process.env.TRANSPORT_LOG_LEVEL
        ? splitLogLevel(process.env.TRANSPORT_LOG_LEVEL)
        : ['error'],

    transportSentryConfig: {
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
       * @param logLevel - Log level
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
