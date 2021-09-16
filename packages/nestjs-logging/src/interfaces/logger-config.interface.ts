import { LogLevel } from '@nestjs/common';

/**
 * Logger config interface
 * 
 * ### example
 * ```ts
 * export const loggerConfig = registerAs(
 *  'LOGGER_MODULE_CONFIG',
 *  (): LoggerConfigInterface => ({
 *    logLevel: process.env?.LOG_LEVEL
 *      ? splitLogLevel(process.env.LOG_LEVEL)
 *      : ['error'],
 *    transportLogLevel: process.env?.TRANSPORT_LOG_LEVEL
 *      ? splitLogLevel(process.env.TRANSPORT_LOG_LEVEL)
 *      : [],
 *  })
 *);
 *
 * ```
 */
export interface LoggerConfigInterface {
  
  /**
   * list of log levels allowed
   */
  logLevel: LogLevel[];

  /**
   * List of transport log level allowed
   */
  transportLogLevel?: LogLevel[];
}
