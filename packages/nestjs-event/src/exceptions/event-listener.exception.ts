import { NotAnErrorException } from '@concepta/ts-core';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

/**
 * Thrown when an error is caught when subscribing or
 * managing a {@link EventListener} of an {@link Event}.
 */
export class EventListenerException extends RuntimeException {
  context: RuntimeException['context'] & {
    originalError: Error;
  };

  constructor(
    originalError?: unknown,
    message = 'Error occurred in event listener',
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message,
      ...options,
    });
    this.context = {
      ...super.context,
      originalError:
        originalError instanceof Error
          ? originalError
          : new NotAnErrorException(originalError),
    };
    this.errorCode = 'EVENT_LISTENER_ERROR';
  }
}
