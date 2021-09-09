import { LogLevel } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { LoggerConfigInterface } from '../interfaces/logger-config.interface';

/**
 * Configuration for Logger
 */
export const loggerConfig = registerAs(
  'LOGGER_MODULE_CONFIG',
  (): LoggerConfigInterface => ({
    logLevel: process.env?.LOG_LEVEL
      ? splitLogLevel(process.env.LOG_LEVEL)
      : ['error'],
    transportLogLevel: process.env?.TRANSPORT_LOG_LEVEL
      ? splitLogLevel(process.env.TRANSPORT_LOG_LEVEL)
      : [],
  })
);

/**
 * Helper to split log level string and assign to correct log level type.
 *
 * @param levels
 */
function splitLogLevel(levels: string): LogLevel[] {
  // get raw strings
  const levelTypes: string[] = levels.split(',');
  // map all to log level enum
  return levelTypes.map(levelType => {
    return levelType.trim() as LogLevel;
  });
}
