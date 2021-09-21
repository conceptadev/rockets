import { LogLevel } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { LoggerConfigInterface } from '../interfaces/logger-config.interface';
import { Severity as SentryLogSeverity } from '@sentry/types';


const defaultConfig: LoggerConfigInterface = {
    
  /**
   * Get log levels from environment variables
   */
  logLevel: process.env?.LOG_LEVEL
    ? splitLogLevel(process.env.LOG_LEVEL)
    : ['error'],

  /**
   * Get transport log levels from environment variables
   */
  transportLogLevel: process.env?.TRANSPORT_LOG_LEVEL
    ? splitLogLevel(process.env.TRANSPORT_LOG_LEVEL)
    : ['error'],
  
  transportSentryConfig: {

    /**
     * Sentry DNS
     */
    dsn: process.env?.SENTRY_DSN ? process.env?.SENTRY_DSN : '',
  
    /**
     * Mapping from log level to sentry severity
     * @param logLevel 
     * @returns SentryLogSeverity
     */
    logLevelMap: (logLevel: LogLevel): SentryLogSeverity => {
      switch (logLevel) {
        case 'error':
          return SentryLogSeverity.Error;
        case 'debug':
          return SentryLogSeverity.Debug;
        case 'log':
          return SentryLogSeverity.Log;
        case 'warn':
          return SentryLogSeverity.Warning;
        case 'verbose':
          return SentryLogSeverity.Info;
      }
    },
  }
};

/**
 * Configuration for Logger to define the log level
 * to be used on logging
 *
 * ### example
 * ```ts
 * @Module({
 *   imports: [
 *     ConfigModule.forFeature(loggerConfig)
 *   ],
 *  ...
 * })
 * ```
 */

// TODO: When i add the defaultConfig here instead of inline object it breaks tests
// where checks for envs  
export const loggerConfig =  registerAs(
  'LOGGER_MODULE_CONFIG',
  (): LoggerConfigInterface => ({
    
    /**
     * Get log levels from environment variables
     */
    logLevel: process.env?.LOG_LEVEL
      ? splitLogLevel(process.env.LOG_LEVEL)
      : ['error'],
  
    /**
     * Get transport log levels from environment variables
     */
    transportLogLevel: process.env?.TRANSPORT_LOG_LEVEL
      ? splitLogLevel(process.env.TRANSPORT_LOG_LEVEL)
      : ['error'],
    
    transportSentryConfig: {
  
      /**
       * Sentry DNS
       */
      dsn: process.env?.SENTRY_DSN ? process.env?.SENTRY_DSN : '',
    
      /**
       * Mapping from log level to sentry severity
       * @param logLevel 
       * @returns SentryLogSeverity
       */
      logLevelMap: (logLevel: LogLevel): SentryLogSeverity => {
        switch (logLevel) {
          case 'error':
            return SentryLogSeverity.Error;
          case 'debug':
            return SentryLogSeverity.Debug;
          case 'log':
            return SentryLogSeverity.Log;
          case 'warn':
            return SentryLogSeverity.Warning;
          case 'verbose':
            return SentryLogSeverity.Info;
        }
      },
    }
  }),
);

export const loggerConfigMerge = (overwriteConfig?:LoggerConfigInterface) => {
  
  const finalConfig = { ...defaultConfig, ...overwriteConfig };

  return registerAs(
    'LOGGER_MODULE_CONFIG',
    (): LoggerConfigInterface => (finalConfig),
  );
} 

/**
 * Helper to split log level string and assign to correct log level type.
 *
 * @param levels
 */
function splitLogLevel(levels: string): LogLevel[] {
  // get raw strings
  const levelTypes: string[] = levels.split(',');

  // map all to log level enum
  return levelTypes.map((levelType) => {
    return levelType.trim() as LogLevel;
  });
}
