import { Inject, Injectable, LogLevel } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { LoggerTransportInterface } from '@concepta/nestjs-logger';
import { LoggerSentrySettingsInterface } from '../interfaces/logger-sentry-settings.interface';
import { LOGGER_SENTRY_MODULE_SETTINGS_TOKEN } from '../config/logger-sentry.config';

/**
 * The transport that implements {@link LoggerTransportInterface}
 * to be used on {@link LoggerSentryService} to log external messages
 *
 * @example
 * ```ts
 * // Get the transport instance
 * const sentry = app.get(LoggerSentryTransport);
 *
 * // Add the transports you want to use
 * customLoggerSentry.addTransport(sentry);
 * ```
 */
@Injectable()
export class LoggerSentryTransport implements LoggerTransportInterface {
  logLevel?: LogLevel[] | null;

  /**
   * Constructor
   *
   * @param settings - configuration file injected
   */
  constructor(
    @Inject(LOGGER_SENTRY_MODULE_SETTINGS_TOKEN)
    protected readonly settings: LoggerSentrySettingsInterface,
  ) {
    const config = settings.transportConfig;
    if (!config) throw new Error('Sentry Config is required');

    this.logLevel = settings.logLevel;

    // Initialize Sentry
    Sentry.init(config);
  }

  /**
   * Method to log message to Sentry transport
   *
   * @param message - Message to log
   * @param logLevel - Level of severity
   * @param error - Error to log
   */
  log(message: string, logLevel: LogLevel, error?: Error | string): void {
    // map the internal log level to sentry log severity
    const severity = this.settings.logLevelMap(logLevel);

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
