import { NotAnErrorException } from '@concepta/ts-core';
import { EventInterface } from '../events/interfaces/event.interface';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

/**
 * Thrown when an error is caught when dispatching an {@link Event}.
 */
export class EventDispatchException<P, R> extends RuntimeException {
  context: {
    event: EventInterface<P, R>;
    originalError: Error;
  };

  constructor(
    event: EventInterface<P, R>,
    originalError: unknown,
    message = 'Error while trying to dispatch the event with key %s',
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message,
      messageParams: [event.key],
      ...options,
    });
    this.context = {
      ...super.context,
      event,
      originalError:
        originalError instanceof Error
          ? originalError
          : new NotAnErrorException(originalError),
    };
    this.errorCode = 'EVENT_DISPATCH_ERROR';
  }
}
