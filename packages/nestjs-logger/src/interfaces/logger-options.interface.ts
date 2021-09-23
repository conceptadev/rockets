import { LogLevel } from '@nestjs/common';
import { LoggerSentryConfigInterface } from './logger-sentry-config.interface';

/**
 * Logger options interface.
 */
export interface LoggerOptionsInterface {
  /**
   * list of log levels allowed
   */
  logLevel?: LogLevel[];

  /**
   * List of transport log level allowed
   */
  transportLogLevel?: LogLevel[];

  /**
   * Configuration for Sentry
   */
  transportSentryConfig?: LoggerSentryConfigInterface;
}
