import { EventInterface } from './event.interface';

/**
 * The interface that all sync events must adhere to
 *
 */
export interface EventSyncInterface<V = undefined>
  extends EventInterface<V, void> {}
