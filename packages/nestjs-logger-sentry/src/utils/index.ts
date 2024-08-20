import { LoggerMessageInterface } from '@concepta/nestjs-logger';

import { LogLevel } from '@nestjs/common';
import { Severity } from '@sentry/types';
/**
 * Mapping from log level to sentry severity
 *
 * @param logLevel - The log level
 * @returns Severity
 */
export const logLevelMap = (logLevel: LogLevel): Severity => {
  switch (logLevel) {
    case 'error':
      return Severity.Error;
    case 'debug':
      return Severity.Debug;
    case 'log':
      return Severity.Log;
    case 'warn':
      return Severity.Warning;
    case 'verbose':
      return Severity.Info;
    default:
      return Severity.Log;
  }
};

export const formatMessage = (
  loggerMessage: LoggerMessageInterface,
): string => {
  return loggerMessage.message || '';
};
