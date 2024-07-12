import {
  ConfigFactory,
  ConfigFactoryKeyHost,
  registerAs,
} from '@nestjs/config';

import { LoggerSentrySettingsInterface } from '../interfaces/logger-sentry-settings.interface';
// TODO: maybe change this to core module?
import { splitLogLevel } from '@concepta/nestjs-logger';
import { formatMessage, logLevelMap } from '../utils';

/**
 * The token to which all logger-sentry module settings are set.
 */
export const LOGGER_SENTRY_MODULE_SETTINGS_TOKEN =
  'LOGGER_SENTRY_MODULE_SETTINGS_TOKEN';

/**
 * LoggerSentry config factory type.
 */
export type LoggerSentryConfigFactory =
  ConfigFactory<LoggerSentrySettingsInterface> & ConfigFactoryKeyHost;

/**
 * Configuration for LoggerSentry.
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
export const loggerSentryConfig: (() => LoggerSentrySettingsInterface) &
  ConfigFactoryKeyHost<ReturnType<() => LoggerSentrySettingsInterface>> =
  registerAs(
    'LOGGER_SENTRY_MODULE_DEFAULT_CONFIG',
    (): LoggerSentrySettingsInterface => ({
      /**
       * Get log levels from environment variables
       */
      logLevel:
        'SENTRY_LOG_LEVEL' in process.env && process.env.SENTRY_LOG_LEVEL
          ? splitLogLevel(process.env.SENTRY_LOG_LEVEL)
          : ['error'],

      logLevelMap: logLevelMap,
      formatMessage: formatMessage, 
      transportConfig: {
        /**
         * Sentry DNS
         */
        dsn:
          'SENTRY_DSN' in process.env && process.env.SENTRY_DSN
            ? process.env.SENTRY_DSN
            : '',

      },
    }),
  );
