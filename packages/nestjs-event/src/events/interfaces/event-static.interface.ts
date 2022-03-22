import { EventKeyInterface } from './event-key.interface';
import { EventInterface } from './event.interface';

/**
 * Interface defining static signature of newable events.
 */
export interface EventStaticInterface<E extends EventInterface = EventInterface>
  extends EventKeyInterface {
  /**
   * @private
   */
  new (...values: E['values']): E;
}
