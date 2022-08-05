import { EventSyncInterface } from './interfaces/event-sync.interface';
import { Event } from './event';

/**
 * Abstract synchronous event class.
 *
 * To create a custom event, extend the
 * {@link EventSync} class.
 *
 * You can override and customize the [values]{@link Event#values} getter
 * if desired. Please read the documentation for the abstract {@link Event} class
 * for the complete documentation.
 *
 * For asynchronous events, see the {@link EventAsync} abstract class.
 *
 * ### Example
 * ```ts
 * // event values type
 * type MyObject = {id: number, active: boolean};
 * type MyEventValues = [MyObject];
 *
 * // event class
 * class MyEvent extends Event<MyEventValues> {}
 *
 * // create an event
 * const myEvent = new MyEvent({id: 1234, active: true});
 * ```
 *
 */
export abstract class EventSync<V = undefined>
  extends Event<V, void>
  implements EventSyncInterface<V> {}
