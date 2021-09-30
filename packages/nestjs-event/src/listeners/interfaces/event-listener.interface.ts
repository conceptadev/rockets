import { EventInterface } from '../../events/interfaces/event.interface';
import { Listener as EmitterListener } from 'eventemitter2';

/**
 * The interface that defines Event Listener signature.
 */
export interface EventListenerInterface<
  E extends EventInterface = EventInterface,
> {
  /**
   * Listener handler.
   */
  listen(event: E): E['expectsReturnOf'];

  /**
   * Called after successful subscription.
   *
   * @param {EmitterListener} emitterListener The Listener object returned by EventEmitter2
   */
  subscription(emitterListener: EmitterListener): void;

  /**
   * Remove the subscription.
   */
  remove(): void;
}
