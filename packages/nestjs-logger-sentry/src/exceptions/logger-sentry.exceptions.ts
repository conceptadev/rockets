import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

export class LoggerSentryException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super(options);
    this.errorCode = 'LOGGER_SENTRY_EXCEPTION';
  }
}
