import { EventInstance } from '../../event-types';
import { EventKeyInterface } from './event-key.interface';

/**
 * Interface defining static signature of newable events.
 */
export interface EventClassInterface<E> extends EventKeyInterface {
  /**
   * @private
   */
  new (...values: (E & EventInstance<E>)['values']): E & EventInstance<E>;
}
