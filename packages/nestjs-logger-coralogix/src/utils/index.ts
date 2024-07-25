import { LoggerMessageInterface } from '@concepta/nestjs-logger';
import { LogLevel } from '@nestjs/common';
import { Severity } from 'coralogix-logger';

export const logLevelMap = (logLevel: LogLevel): Severity => {
  switch (logLevel) {
    case 'error':
      return Severity.error;
    case 'debug':
      return Severity.debug;
    case 'log':
      return Severity.info;
    case 'warn':
      return Severity.warning;
    case 'verbose':
      return Severity.verbose;
  }
};

export const formatMessage = (
  loggerMessage: LoggerMessageInterface,
): string => {
  return loggerMessage.message || '';
};
