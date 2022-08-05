import { EventInterface } from './event.interface';

/**
 * The interface that all sync events must adhere to
 *
 */
export interface EventSyncInterface<P = undefined>
  extends EventInterface<P, void> {}
