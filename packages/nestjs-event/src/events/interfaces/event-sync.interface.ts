import { EventValues } from '../../event-types';
import { EventInterface } from './event.interface';

/**
 * The interface that all sync events must adhere to
 *
 */
export interface EventSyncInterface<V extends EventValues = EventValues>
  extends EventInterface<V, void> {}
