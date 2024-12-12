import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { EventInterface } from '../events/interfaces/event.interface';
import { EventException } from './event.exception';

/**
 * Thrown when an error is caught when dispatching an {@link Event}.
 */
export class EventDispatchException<P, R> extends EventException {
  context: RuntimeException['context'] & {
    event: EventInterface<P, R>;
  };

  constructor(event: EventInterface<P, R>, options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to dispatch the event with key %s',
      messageParams: [event.key],
      ...options,
    });

    this.context = {
      ...super.context,
      event,
    };

    this.errorCode = 'EVENT_DISPATCH_ERROR';
  }
}
