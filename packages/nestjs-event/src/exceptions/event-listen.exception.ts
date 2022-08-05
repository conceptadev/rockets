import { ExceptionInterface, NotAnErrorException } from '@concepta/ts-core';
import { EventListenOnInterface } from '../services/interfaces/event-listen-on.interface';

/**
 * Thrown when an error is caught when listening on an {@link EventListenOn}.
 */
export class EventListenException<E>
  extends Error
  implements ExceptionInterface
{
  errorCode = 'EVENT_LISTEN_ERROR';

  context: {
    listener: EventListenOnInterface<E>;
    originalError: Error;
  };

  constructor(
    listener: EventListenOnInterface<E>,
    originalError: unknown,
    message = 'Error while trying to listen on an event',
  ) {
    super(message);
    this.context = {
      listener,
      originalError:
        originalError instanceof Error
          ? originalError
          : new NotAnErrorException(originalError),
    };
  }
}
