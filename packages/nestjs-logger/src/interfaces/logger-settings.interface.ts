import { LogLevel } from '@nestjs/common';
import { LoggerConfigInterface } from './logger-config.interface';

/**
 * Logger options interface.
 */
export interface LoggerSettingsInterface {
  /**
   * list of log levels allowed
   */
  logLevel: LogLevel[];

  // TODO: move the methods to uplevel, ins that case should this be a unknown? instead
  transportConfig?: LoggerConfigInterface;
}
