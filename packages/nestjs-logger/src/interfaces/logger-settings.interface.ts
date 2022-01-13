import { LogLevel } from '@nestjs/common';
import { LoggerSentryConfigInterface } from './logger-sentry-config.interface';

/**
 * Logger options interface.
 */
export interface LoggerSettingsInterface {
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
