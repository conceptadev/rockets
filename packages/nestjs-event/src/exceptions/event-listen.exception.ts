import { NotAnErrorException } from '@concepta/ts-core';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { EventListenOnInterface } from '../services/interfaces/event-listen-on.interface';

/**
 * Thrown when an error is caught when listening on an {@link EventListenOn}.
 */
export class EventListenException<E> extends RuntimeException {
  context: {
    listener: EventListenOnInterface<E>;
    originalError: Error;
  };

  constructor(
    listener: EventListenOnInterface<E>,
    originalError: unknown,
    message = 'Error while trying to listen on an event',
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message,
      ...options,
    });
    this.context = {
      listener,
      originalError:
        originalError instanceof Error
          ? originalError
          : new NotAnErrorException(originalError),
    };
    this.errorCode = 'EVENT_LISTEN_ERROR';
  }
}
