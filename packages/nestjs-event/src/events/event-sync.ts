import { EventSyncInterface } from './interfaces/event-sync.interface';
import { Event } from './event';
import { EventManager } from '../event-manager';

/**
 * Abstract synchronous event class.
 *
 * To create a custom event, extend the
 * {@link EventSync} class.
 *
 * You can override and customize the [payload]{@link Event#payload} getter
 * if desired. Please read the documentation for the abstract {@link Event} class
 * for the complete documentation.
 *
 * For asynchronous events, see the {@link EventAsync} abstract class.
 *
 * @example
 * ```ts
 * // event payload type
 * type MyPayloadType = {id: number, active: boolean};
 *
 * // event class
 * class MyEvent extends EventSync<MyPayloadType> {}
 *
 * // create an event
 * const myEvent = new MyEvent({id: 1234, active: true});
 *
 * // emit the event
 * myEvent.emit();
 * ```
 */
export abstract class EventSync<P = undefined>
  extends Event<P, void>
  implements EventSyncInterface<P>
{
  /**
   * Emit the event.
   */
  emit(): boolean {
    return EventManager.dispatch.sync<P>(this);
  }
}
