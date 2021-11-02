import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventDispatchException } from '../exceptions/event-dispatch.exception';
import { EventAsyncInterface } from '../events/interfaces/event-async.interface';
import { EventSyncInterface } from '../events/interfaces/event-sync.interface';
import { EventValues } from '../event-types';

/**
 * Event Dispatch Service
 *
 * This service coordinates the dispatching of events to the NestJS EventEmitter module.
 */
@Injectable()
export class EventDispatchService {
  /**
   * Constructor
   *
   * @param {EventEmitter2} eventEmitter Injected event emitter instance
   */
  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Dispatch an event synchronously.
   *
   * Synchronously calls each of the listeners registered for the event,
   * in the order they were registered, passing the event arguments to each.
   *
   * ### Example
   * ```ts
   * import { Injectable } from '@nestjs/common';
   * import { EventDispatchService, EventSync } from '@rockts-org/nestjs-events';
   *
   * // event values type
   * export type MyEventValues = [{id: number}];
   *
   * // event class
   * export class MyEvent extends EventSync<MyEventValues> {}
   *
   * @Injectable()
   * class MyClass {
   *   constructor(private eventDispatchService: EventDispatchService) {}
   *
   *   didSomething() {
   *     // event instance
   *     const myEvent = new MyEvent({id: 1234});
   *     // dispatch the event
   *     this.eventDispatchService.sync(myEvent);
   *   }
   * }
   * ```
   *
   * @param {EventSyncInterface} event The event being dispatched.
   * @returns boolean Returns true if the event had listeners, false otherwise.
   */
  sync<V extends EventValues = EventValues>(
    event: EventSyncInterface<V>,
  ): boolean {
    try {
      // call event dispatcher
      return this.eventEmitter.emit(event.key, event);
    } catch (e) {
      throw new EventDispatchException(e.message);
    }
  }

  /**
   * Dispatch an event asynchronously.
   *
   * Asynchronously calls each of the listeners registered for the event,
   * in the order they were registered, passing the event arguments to each.
   *
   * ```ts
   * import { Injectable } from '@nestjs/common';
   * import { EventDispatchService, EventAsync } from '@rockts-org/nestjs-events';
   *
   * // expected object
   * export type MyObject = {id: number, active: boolean};
   *
   * // event args (object is first argument)
   * export type MyEventValues = [MyObject];
   *
   * // event class
   * export class MyEvent extends EventAsync<MyEventValues> {}
   *
   * @Injectable()
   * class MyClass {
   *   constructor(private eventDispatchService: EventDispatchService) {}
   *
   *   // allow any listener to activate object
   *   async maybeActivate(myObject: MyObject): MyObject {
   *     // event instance
   *     const myEvent = new MyEvent({...myObject, active: false});
   *     // dispatch the event
   *     const allValues: MyEventValues[] =
   *       await this.eventDispatchService.async(myEvent);
   *     // merge it
   *     allValues.forEach((values) => {
   *       const [eachObject: MyObject] = values;
   *       // did any listener set it to true?
   *       if (eachObject.active) {
   *         myObject.active = true;
   *       }
   *     });
   *     // return possibly modified object
   *     return myObject;
   *   }
   * }
   * ```
   *
   * @param {EventAsyncInterface} event The event being dispatched.
   * @returns {Promise<V[]>} An array of values, one for each listener that subscribed to the event.
   */
  async async<V extends EventValues = EventValues>(
    event: EventAsyncInterface<V>,
  ): Promise<V[]> {
    // our result
    let result: V[];

    try {
      // call async event dispatcher
      // we await the result here in order to catch any exception thrown
      result = await this.eventEmitter.emitAsync(event.key, event);
    } catch (e) {
      throw new EventDispatchException(e.message);
    }

    // final array of results
    return result;
  }
}
