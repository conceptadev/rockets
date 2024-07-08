import { LogLevel } from '@nestjs/common';
import { NodeOptions as SentryNodeOptions } from '@sentry/node';
import { Severity as SentrySeverity } from '@sentry/types';
import {
  LoggerConfigInterface,
  LoggerMessageInterface,
} from '@concepta/nestjs-logger';

/**
 * Interface for Sentry configuration to define the log level
 * mapping to be used on Sentry transport.
 */
export interface LoggerSentryConfigInterface
  extends LoggerConfigInterface,
    SentryNodeOptions {
  dsn: string;
  /**
   * Method to map the log level from the config with sentry log levels
   */
  logLevelMap: (logLevel: LogLevel) => SentrySeverity;

  formatMessage?: (loggerMessage: LoggerMessageInterface) => string;
}
