import { EventKeyInterface } from './event-key.interface';
import { EventExpectsReturnOfInterface } from './event-expects-return-of.interface';
import { EventValues } from '../../event-types';

/**
 * The interface that defines Event key and values signatures.
 */
export interface EventInterface<V = undefined, R = V>
  extends EventKeyInterface,
    EventExpectsReturnOfInterface<R> {
  /**
   * Return the values that should be emitted.
   */
  values: EventValues<V> | [];
}
