import { HttpException, Inject, Injectable, LogLevel } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { LoggerTransportInterface } from '@concepta/nestjs-logger';
import { LoggerSentrySettingsInterface } from '../interfaces/logger-sentry-settings.interface';
import { LOGGER_SENTRY_MODULE_SETTINGS_TOKEN } from '../config/logger-sentry.config';
import { RuntimeException, mapHttpStatus } from '@concepta/nestjs-exception';
import { Extras } from '@sentry/types';
import { isObject } from 'class-validator';

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
  log(
    message: string,
    logLevel: LogLevel,
    error?: Error | string | RuntimeException,
  ): void {
    // map the internal log level to sentry log severity
    const severity = this.settings.logLevelMap(logLevel);

    // call sentry
    if (error) {
      // its an error, use error message
      Sentry.captureException(error, {
        level: severity,
        extra: {
          developerMessage: message,
          ...this.getExtras(error),
        },
      });
    } else {
      // its a string, just send it
      Sentry.captureMessage(message, severity);
    }
  }

  private getExtras(
    exception?: Error | string | RuntimeException | HttpException,
  ): Extras {
    const extras: Extras = {};
    if (exception instanceof HttpException) {
      this.handleHttpException(exception, extras);
    } else if (exception instanceof RuntimeException) {
      this.handleRuntimeException(exception, extras);
    } else if (exception instanceof Error) {
      this.handleError(exception, extras);
    } else if (typeof exception === 'string') {
      this.handleStringException(exception, extras);
    }

    return extras;
  }

  private handleHttpException(exception: HttpException, extras: Extras): void {
    const res = exception.getResponse();
    extras.statusCode = exception.getStatus();
    extras.errorCode = mapHttpStatus(extras.statusCode as number);
    extras.message = isObject(res) && 'message' in res ? res.message : res;
  }

  private handleRuntimeException(
    exception: RuntimeException,
    extras: Extras,
  ): void {
    extras.errorCode = exception?.errorCode;
    extras.statusCode = exception?.httpStatus;
    extras.message = exception?.message;
    extras.safeMessage = exception?.safeMessage;
    extras.context = exception?.context;
  }

  private handleError(exception: Error, extras: Extras): void {
    extras.message = exception?.message;
    extras.originalError = exception?.stack || '';
  }

  private handleStringException(exception: string, extras: Extras): void {
    extras.message = exception;
  }
}
