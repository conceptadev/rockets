import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { NotAnErrorException } from '@concepta/ts-core';
import { EventDispatchException } from '../exceptions/event-dispatch.exception';
import { EventSyncInterface } from '../events/interfaces/event-sync.interface';
import {
  EventValues,
  EventAsyncInstance,
  EventReturnValueType,
} from '../event-types';
import { EVENT_MODULE_EMITTER_SERVICE_TOKEN } from '../event-constants';

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
  constructor(
    @Inject(EVENT_MODULE_EMITTER_SERVICE_TOKEN)
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Dispatch an event synchronously.
   *
   * Synchronously calls each of the listeners registered for the event,
   * in the order they were registered, passing the event arguments to each.
   *
   * ### Example
   * ```ts
   * import { Injectable } from '@nestjs/common';
   * import { EventDispatchService, EventSync } from '@concepta/nestjs-events';
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
   * @returns {boolean} boolean Returns true if the event had listeners, false otherwise.
   */
  sync<V extends EventValues = EventValues>(
    event: EventSyncInterface<V>,
  ): boolean {
    try {
      // call event dispatcher
      return this.eventEmitter.emit(event.key, event);
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      throw new EventDispatchException(exception.message);
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
   * import { EventDispatchService, EventAsync } from '@concepta/nestjs-events';
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
   * @template V The type of the event values.
   * @returns {Promise<V[]>} An array of values, one for each listener that subscribed to the event.
   */
  async async<E>(
    event: E & EventAsyncInstance<E>,
  ): Promise<EventReturnValueType<E>[]> {
    // our result
    let result: EventReturnValueType<E>[];

    try {
      // call async event dispatcher
      // we await the result here in order to catch any exception thrown
      result = await this.eventEmitter.emitAsync(event.key, event);
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      throw new EventDispatchException(exception.message);
    }

    // final array of results
    return result;
  }
}
