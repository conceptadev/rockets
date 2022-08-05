import { Listener as EmitterListener } from 'eventemitter2';
import { EventInstance, EventReturnType } from '../../event-types';

/**
 * The interface that defines Event Listener signature.
 */
export interface EventListenerInterface<E> {
  /**
   * Listener handler.
   */
  listen(event: EventInstance<E>): EventReturnType<E>;

  /**
   * Called after successful subscription.
   *
   * @param emitterListener The Listener object returned by EventEmitter2
   */
  subscription(emitterListener: EmitterListener): void;

  /**
   * Remove the subscription.
   */
  remove(): void;
}
