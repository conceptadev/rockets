import { LoggerMessageInterface } from '@concepta/nestjs-logger';
import { Severity as SentryLogSeverity } from '@sentry/types';
import { LogLevel } from '@nestjs/common';
/**
 * Mapping from log level to sentry severity
 *
 * @param logLevel - The log level
 * @returns SentryLogSeverity
 */
export const logLevelMap = (logLevel: LogLevel): SentryLogSeverity => {
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
};

export const formatMessage = (
  loggerMessage: LoggerMessageInterface,
): string => {
  return loggerMessage.message || '';
};
