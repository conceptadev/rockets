import { Inject, Injectable, LogLevel } from '@nestjs/common';
import * as Sentry from '@sentry/node';

import { LOGGER_MODULE_OPTIONS_TOKEN } from '../config/logger.config';
import { LoggerOptionsInterface } from '../interfaces/logger-options.interface';
import { LoggerTransportInterface } from '../interfaces/logger-transport.interface';

/**
 * The transport that implements {@link LoggerTransportInterface}
 * to be used on {@link LoggerService} to log external messages
 *
 * ### Example
 * ```ts
 * // Get the transport instance
 * const sentry = app.get(LoggerSentryTransport);
 *
 * // Add the transports you want to use
 * customLogger.addTransport(sentry);
 * ```
 */
@Injectable()
export class LoggerSentryTransport implements LoggerTransportInterface {
  /**
   * Constructor
   *
   * @param config configuration file injected
   */
  constructor(
    @Inject(LOGGER_MODULE_OPTIONS_TOKEN)
    private config: LoggerOptionsInterface,
  ) {
    if (!this.config || !this.config.transportSentryConfig)
      throw new Error('Sentry Config is required');

    // Initialize Sentry
    Sentry.init({
      dsn: this.config.transportSentryConfig.dsn,
      logLevel: this.config.transportSentryConfig.logLevel,
    });
  }

  /**
   * Method to log message to Sentry transport
   *
   * @param message
   * @param logLevel
   * @param error
   */
  log(message: string, logLevel: LogLevel, error?: Error | string): void {
    // map the internal log level to sentry log severity
    const severity = this.config.transportSentryConfig.logLevelMap(logLevel);

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
