import { EventKeyInterface } from './event-key.interface';
import { EventValues } from '../../event-types';

/**
 * The interface that defines Event key and values signatures.
 */
export interface EventInterface<V extends EventValues = EventValues>
  extends EventKeyInterface {
  /**
   * What type must the listener return?
   *
   * @private
   */
  expectsReturnOf: void | Promise<V>;

  /**
   * Return the values that should be emitted.
   */
  values: V;
}
