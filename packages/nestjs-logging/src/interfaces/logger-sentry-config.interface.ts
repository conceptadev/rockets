import { LogLevel } from '@nestjs/common';
import { NodeOptions as SentryNodeOptions } from '@sentry/node/dist/types';
import { Severity as SentrySeverity } from '@sentry/types';

/**
 * Interface for Sentry configuration to define the log level
 * mapping to be used on Sentry transport
 *
 * ### example
 * ```ts
 *
 * export const loggerSentryConfig = registerAs(
 *   'LOGGER_MODULE_SENTRY_CONFIG',
 *   (): LoggerSentryConfigInterface => ({
 *     dsn: process.env?.SENTRY_DSN ?? '',
 *     logLevelMap: (logLevel: LogLevel): SentryLogSeverity => {
 *       switch (logLevel) {
 *         case 'error':
 *           return SentryLogSeverity.Error;
 *         case 'debug':
 *           return SentryLogSeverity.Debug;
 *         case 'log':
 *           return SentryLogSeverity.Log;
 *         case 'warn':
 *           return SentryLogSeverity.Warning;
 *         case 'verbose':
 *           return SentryLogSeverity.Info;
 *       }
 *     },
 *   })
 * );
 * ```
 */
export interface LoggerSentryConfigInterface extends SentryNodeOptions {
  /**
   * Method to map the log level from the config with sentry log levels
   */
   logLevelMap: (logLevel: LogLevel) => SentrySeverity;
}
