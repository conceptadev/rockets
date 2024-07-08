import { Injectable, LogLevel } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { LoggerSentryConfigInterface } from '../interfaces/logger-sentry-config.interface';
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
   * @param config - configuration file injected
   */
  constructor(protected readonly config: LoggerSentryConfigInterface) {
    if (!this.config) throw new Error('Sentry Config is required');

    // Initialize Sentry
    Sentry.init({
      dsn: this.config.dsn,
    });
  }

  /**
   * Method to log message to Sentry transport
   *
   * @param message - message
   * @param logLevel - log level
   * @param error - error
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
