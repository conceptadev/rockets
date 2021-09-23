import { LogLevel } from '@nestjs/common';
import { NodeOptions as SentryNodeOptions } from '@sentry/node/dist/types';
import { Severity as SentrySeverity } from '@sentry/types';

/**
 * Interface for Sentry configuration to define the log level
 * mapping to be used on Sentry transport.
 */
export interface LoggerSentryConfigInterface extends SentryNodeOptions {
  /**
   * Method to map the log level from the config with sentry log levels
   */
  logLevelMap: (logLevel: LogLevel) => SentrySeverity;
}
