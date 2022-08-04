import { EventListenOnOptionsInterface } from './event-listen-on-options.interface';
import { EventListenerInterface } from '../../listeners/interfaces/event-listener.interface';

/**
 * The interface that defines Event Listen On signature.
 */
export interface EventListenOnInterface<E> extends EventListenerInterface<E> {
  /**
   * Options to be passed to Event Emitter 2 at the time of subscription.
   */
  options: EventListenOnOptionsInterface;
}
