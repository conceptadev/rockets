import { EventInterface } from './event.interface';

/**
 * The interface that all async events must adhere to
 */
export interface EventAsyncInterface<P = undefined, R = P>
  extends EventInterface<P, Promise<R>> {}
