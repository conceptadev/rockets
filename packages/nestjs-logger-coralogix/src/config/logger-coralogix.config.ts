import {
  ConfigFactory,
  ConfigFactoryKeyHost,
  registerAs,
} from '@nestjs/config';

import { splitLogLevel } from '@concepta/nestjs-logger';
import { LoggerMessageInterface } from '@concepta/nestjs-logger/dist/interfaces/logger-message.interface';
import { LogLevel } from '@nestjs/common';
import { Severity } from 'coralogix-logger';
import { LoggerCoralogixSettingsInterface } from '../interfaces/logger-coralogix-settings.interface';

/**
 * The token to which all coralogix module settings are set.
 */
export const LOGGER_CORALOGIX_MODULE_SETTINGS_TOKEN =
  'LOGGER_CORALOGIX_MODULE_SETTINGS_TOKEN';

/**
 * Coralogix config factory type.
 */
export type CoralogixConfigFactory =
  ConfigFactory<LoggerCoralogixSettingsInterface> & ConfigFactoryKeyHost;

/**
 * Configuration for Coralogix.
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
export const coralogixConfig: (() => LoggerCoralogixSettingsInterface) &
  ConfigFactoryKeyHost<ReturnType<() => LoggerCoralogixSettingsInterface>> =
  registerAs(
    'LOGGER_CORALOGIX_MODULE_DEFAULT_CONFIG',
    (): LoggerCoralogixSettingsInterface => ({
      /**
       * Get log levels from environment variables
       */
      logLevel:
        'CORALOGIX_LOG_LEVEL' in process.env && process.env.CORALOGIX_LOG_LEVEL
          ? splitLogLevel(process.env.CORALOGIX_LOG_LEVEL)
          : ['error'],

      transportConfig: {
        category:
          'CORALOGIX_CATEGORY' in process.env && process.env.CORALOGIX_CATEGORY
            ? process.env.CORALOGIX_CATEGORY
            : '',
        applicationName:
          'CORALOGIX_APPLICATION_NAME' in process.env &&
          process.env.CORALOGIX_APPLICATION_NAME
            ? process.env.CORALOGIX_APPLICATION_NAME
            : '',
        privateKey:
          'CORALOGIX_PRIVATE_KEY' in process.env &&
          process.env.CORALOGIX_PRIVATE_KEY
            ? process.env.CORALOGIX_PRIVATE_KEY
            : '',
        subsystemName:
          'CORALOGIX_SUBSYSTEM_NAME' in process.env &&
          process.env.CORALOGIX_SUBSYSTEM_NAME
            ? process.env.CORALOGIX_SUBSYSTEM_NAME
            : '',

        /**
         * Mapping from log level to coralogix severity
         *
         * @param logLevel
         * @returns CoralogixLogSeverity
         */
        // TODO: should this be moved up to settings?
        logLevelMap: (logLevel: LogLevel): Severity => {
          switch (logLevel) {
            case 'error':
              return Severity.error;
            case 'debug':
              return Severity.debug;
            case 'log':
              return Severity.info;
            case 'warn':
              return Severity.warning;
            case 'verbose':
              return Severity.verbose;
          }
        },

        formatMessage: (loggerMessage: LoggerMessageInterface): string => {
          return loggerMessage.message || 'error';
        },
      },
    }),
  );
