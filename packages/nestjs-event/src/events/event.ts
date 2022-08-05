import { EVENT_MODULE_EVENT_KEY_PREFIX } from '../event-constants';
import { EventPayload } from '../event-types';
import { EventInterface } from './interfaces/event.interface';

/**
 * Abstract event class.
 *
 * To create a custom event, extend the {@link Event} class.
 *
 * You must implement one of the {@link EventSyncInterface} or {@link EventAsyncInterface}
 * interfaces.
 *
 * There are additional abstract classes available which have implemented the
 * sync and async event types for your convenience. They are {@link EventSync}
 * and {@link EventAsync}.
 *
 * ### Example
 * ```ts
 * // event payload type
 * type MyPayloadType = {id: number, active: boolean};
 *
 * // event class
 * class MyEvent extends Event<MyPayloadType>
 *   implements EventSyncInterface<MyPayloadType>
 * {}
 *
 * // create an event
 * const myEvent = new MyEvent({id: 1234, active: true});
 * ```
 *
 * @template P - Event Payload
 * @template R - Event return payload, defaults to Event Payload
 */
export abstract class Event<P = undefined, R = P>
  implements EventInterface<P, R>
{
  /**
   * Expects return of payload
   *
   * @type {R}
   * @private
   */
  readonly expectsReturnOf!: R;

  /**
   * Event key.
   *
   * @returns {string} The event key string.
   */
  static get key(): string {
    return `${EVENT_MODULE_EVENT_KEY_PREFIX}${this.name}`;
  }

  /**
   * Event key.
   *
   * @returns {string} The event key string.
   */
  get key(): string {
    return `${EVENT_MODULE_EVENT_KEY_PREFIX}${this.constructor.name}`;
  }

  /**
   * The payload that was passed to the constructor.
   */
  private _payload: EventPayload<P>;

  /**
   * Constructor
   *
   * @param {EventPayload<P>} payload Payload to emit when the event is dispatched.
   */
  constructor(payload?: EventPayload<P>);

  /**
   * Constructor
   *
   * @param {EventPayload<P>} payload Payload to emit when the event is dispatched.
   */
  constructor(payload: EventPayload<P>) {
    this._payload = payload;
  }

  /**
   * Returns payload that was passed to the Event constructor.
   *
   * @returns {EventPayload<P>} The payload.
   */
  get payload(): EventPayload<P> {
    return this._payload;
  }
}
