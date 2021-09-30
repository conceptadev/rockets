import { EventValues } from '../../event-types';
import { EventInterface } from './event.interface';

/**
 * The interface that all async events must adhere to
 */
export interface EventAsyncInterface<V extends EventValues = EventValues>
  extends EventInterface<V> {
  /**
   * @private
   */
  expectsReturnOf: Promise<V>;
}
