import { EventKeyInterface } from './event-key.interface';
import { EventValues } from '../../event-types';
import { EventExpectsReturnOfInterface } from './event-expects-return-of.interface';

/**
 * The interface that defines Event key and values signatures.
 */
export interface EventInterface<V extends EventValues = EventValues, R = V>
  extends EventKeyInterface,
    EventExpectsReturnOfInterface<R> {
  /**
   * Return the values that should be emitted.
   */
  values: V;
}
