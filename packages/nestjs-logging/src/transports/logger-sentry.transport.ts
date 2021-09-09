import { Inject, Injectable, LogLevel } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as Sentry from '@sentry/node';

import { loggerSentryConfig } from '../config/logger-sentry.config';
import { LoggerTransportInterface } from '../interfaces/logger-transport.interface';

@Injectable()
export class LoggerSentryTransport implements LoggerTransportInterface {
  constructor(
    @Inject(loggerSentryConfig.KEY)
    private config: ConfigType<typeof loggerSentryConfig>
  ) {
    
    if (!this.config)
      throw new Error('Sentry Config is required');
    
    Sentry.init({
      dsn: this.config.dsn,
      logLevel: this.config.logLevel,
    });
  }

  /**
   * Method to log message to Sentry transport
   * @param message 
   * @param logLevel 
   * @param error 
   */
  log(message: string, logLevel: LogLevel, error?: Error | string): void {
    // map the internal log level to sentry log severity
    const severity = this.config.logLevelMap(logLevel);
    // call sentry
    if (error) {
      // its an error, use error message
      Sentry.captureException(error, {
        level: severity,
        // TODO: are we using this extras correctly?
        extra: { developerMessage: message },
      });
    } else {
      // its a string, just send it
      Sentry.captureMessage(message, severity);
    }
  }
}
