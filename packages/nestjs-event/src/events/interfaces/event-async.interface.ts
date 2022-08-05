import { EventInterface } from './event.interface';

/**
 * The interface that all async events must adhere to
 */
export interface EventAsyncInterface<V = undefined, R = V>
  extends EventInterface<V, Promise<R>> {}
