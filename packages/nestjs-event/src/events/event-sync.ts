import { EventSyncInterface } from './interfaces/event-sync.interface';
import { Event } from './event';

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
 * ### Example
 * ```ts
 * // event payload type
 * type MyPayloadType = {id: number, active: boolean};
 *
 * // event class
 * class MyEvent extends Event<MyPayloadType> {}
 *
 * // create an event
 * const myEvent = new MyEvent({id: 1234, active: true});
 * ```
 *
 */
export abstract class EventSync<P = undefined>
  extends Event<P, void>
  implements EventSyncInterface<P> {}
