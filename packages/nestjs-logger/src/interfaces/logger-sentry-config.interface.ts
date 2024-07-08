import { LogLevel } from '@nestjs/common';
import { NodeOptions as SentryNodeOptions } from '@sentry/node';
import { Severity as SentrySeverity } from '@sentry/types';
import { LoggerConfigInterface } from './logger-config.interface';

/**
 * Interface for Sentry configuration to define the log level
 * mapping to be used on Sentry transport.
 */
export interface LoggerSentryConfigInterface
  extends LoggerConfigInterface,
    SentryNodeOptions {
  /**
   * Method to map the log level from the config with sentry log levels
   */
  logLevelMap: (logLevel: LogLevel) => SentrySeverity;
}
