import { LogLevel } from '@nestjs/common';

/**
 * Logger config interface
 */
export interface LoggerConfigInterface {
  logLevel: LogLevel[];
  transportLogLevel?: LogLevel[];
}
