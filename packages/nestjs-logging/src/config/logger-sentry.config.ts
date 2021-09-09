import { LogLevel } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { Severity as SentryLogSeverity } from '@sentry/types';
import { LoggerSentryConfigInterface } from '../interfaces/logger-sentry-config.interface';



export const loggerSentryConfig = registerAs(
  'LOGGER_MODULE_SENTRY_CONFIG',
  (): LoggerSentryConfigInterface => ({
    dsn: process.env?.SENTRY_DSN ?? '',
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
  })
);
