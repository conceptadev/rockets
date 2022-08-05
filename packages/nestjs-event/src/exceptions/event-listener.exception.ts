import { ExceptionInterface, NotAnErrorException } from '@concepta/ts-core';

/**
 * Thrown when an error is caught when subscribing or
 * managing a {@link EventListener} of an {@link Event}.
 */
export class EventListenerException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'EVENT_LISTENER_ERROR';

  context: {
    originalError: Error;
  };

  constructor(
    originalError?: unknown,
    message = 'Error occurred in event listener',
  ) {
    super(message);
    this.context = {
      originalError:
        originalError instanceof Error
          ? originalError
          : new NotAnErrorException(originalError),
    };
  }
}
