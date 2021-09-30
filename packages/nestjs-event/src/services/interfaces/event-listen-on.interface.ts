import { EventListenOnOptionsInterface } from './event-listen-on-options.interface';
import { EventListenerInterface } from '../../listeners/interfaces/event-listener.interface';
import { EventInterface } from '../../events/interfaces/event.interface';

/**
 * The interface that defines Event Listen On signature.
 */
export interface EventListenOnInterface<
  E extends EventInterface = EventInterface,
> extends EventListenerInterface<E> {
  /**
   * Options to be passed to Event Emitter 2 at the time of subscription.
   */
  options: EventListenOnOptionsInterface;
}
