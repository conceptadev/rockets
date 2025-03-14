import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

/**
 * Generic exception.
 */
export class LoggerInvalidLogLevelException extends RuntimeException {
  constructor(levelTrimmed: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'The string "%s" is not a valid log level.',
      messageParams: [levelTrimmed],
      ...options,
    });
    this.errorCode = 'LOGGER_INVALID_LOG_LEVEL_ERROR';
  }
}
