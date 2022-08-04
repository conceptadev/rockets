import { EventValues } from '../../event-types';
import { EventInterface } from './event.interface';

/**
 * The interface that all async events must adhere to
 */
export interface EventAsyncInterface<V extends EventValues = EventValues, R = V>
  extends EventInterface<V, Promise<R>> {}
