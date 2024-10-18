import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

/**
 * Thrown when an error is caught when subscribing or
 * managing a {@link EventListener} of an {@link Event}.
 */
export class EventListenerException extends RuntimeException {
  constructor(options?: RuntimeExceptionOptions) {
    super({
      message: 'Error occurred in event listener',
      ...options,
    });

    this.errorCode = 'EVENT_LISTENER_ERROR';
  }
}
