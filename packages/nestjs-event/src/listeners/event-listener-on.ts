import { EventInterface } from '../events/interfaces/event.interface';
import { EventListener } from './event-listener';
import { EventListenOnInterface } from '../services/interfaces/event-listen-on.interface';
import { EventListenOnOptionsInterface } from '../services/interfaces/event-listen-on-options.interface';

/**
 * Abstract event listen on class.
 *
 * To create a custom event listener, extend the {@link EventListenerOn} class and implement the
 * [listen]{@link EventListenerOn#listen} method. The [listen]{@link EventListenerOn#listen}
 * method will receive the values dispatched by {@link EventDispatchService}.
 *
 * ### Example
 * ```ts
 * // event values type
 * type MyEventValues = [{id: number, active: boolean}];
 *
 * // example event class
 * class MyEvent extends EventSync<MyEventValues> {}
 *
 * // example listener class
 * class MyListenOn extends EventListenerOn<MyEvent> {
 *   // custom handler
 *   listen(event: MyEvent): void {
 *     console.log(event.values);
 *   }
 * }
 *
 * // new listener
 * const myListener = new MyListenOn();
 *
 * // subscribe to the event
 * EventListenService.on(MyEvent, myListener);
 *
 * // and you can remove the listener easily
 * listener.remove();
 * ```
 */
export abstract class EventListenerOn<E extends EventInterface = EventInterface>
  extends EventListener<E>
  implements EventListenOnInterface<E>
{
  /**
   * Constructor
   */
  constructor(private _options: EventListenOnOptionsInterface = {}) {
    super();
  }

  /**
   * Default listener options.
   */
  get options(): EventListenOnOptionsInterface {
    return this._options;
  }
}
