import {
  ConfigFactory,
  ConfigFactoryKeyHost,
  registerAs,
} from '@nestjs/config';

import { LogLevel } from '@nestjs/common';
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
  }),
);
