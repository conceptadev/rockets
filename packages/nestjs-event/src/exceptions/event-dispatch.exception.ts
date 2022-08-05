import { format } from 'util';
import { ExceptionInterface, NotAnErrorException } from '@concepta/ts-core';
import { EventInterface } from '../events/interfaces/event.interface';

/**
 * Thrown when an error is caught when dispatching an {@link Event}.
 */
export class EventDispatchException<P, R>
  extends Error
  implements ExceptionInterface
{
  errorCode = 'EVENT_DISPATCH_ERROR';

  context: {
    event: EventInterface<P, R>;
    originalError: Error;
  };

  constructor(
    event: EventInterface<P, R>,
    originalError: unknown,
    message = 'Error while trying to dispatch the event with key %s',
  ) {
    super(format(message, event.key));
    this.context = {
      event,
      originalError:
        originalError instanceof Error
          ? originalError
          : new NotAnErrorException(originalError),
    };
  }
}
