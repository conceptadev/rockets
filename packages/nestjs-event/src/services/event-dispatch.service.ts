import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { EventDispatchException } from '../exceptions/event-dispatch.exception';
import { EventSyncInterface } from '../events/interfaces/event-sync.interface';
import { EventAsyncInstance, EventReturnPayload } from '../event-types';
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
   * @param eventEmitter - Injected event emitter instance
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
   * // event payload type
   * export type MyPayloadType = {id: number};
   *
   * // event class
   * export class MyEvent extends EventSync<MyPayloadType> {}
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
   * @param event - The event being dispatched.
   * @returns boolean Returns true if the event had listeners, false otherwise.
   */
  sync<P>(event: EventSyncInterface<P>): boolean {
    try {
      // call event dispatcher
      return this.eventEmitter.emit(event.key, event);
    } catch (e) {
      throw new EventDispatchException(event, e);
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
   * export type MyPayloadType = {id: number, active: boolean};
   *
   * // event class
   * export class MyEvent extends EventAsync<MyPayloadType> {}
   *
   * @Injectable()
   * class MyClass {
   *   constructor(private eventDispatchService: EventDispatchService) {}
   *
   *   // allow any listener to activate object
   *   async maybeActivate(myPayloadType: MyPayloadType): MyPayloadType {
   *     // event instance
   *     const myEvent = new MyEvent({...myPayloadType, active: false});
   *     // dispatch the event
   *     const allPayloads: MyPayloadType[] =
   *       await this.eventDispatchService.async(myEvent);
   *     // merge it
   *     allPayloads.forEach((payload) => {
   *       // did any listener set it to true?
   *       if (payload.active) {
   *         myPayloadType.active = true;
   *       }
   *     });
   *     // return possibly modified object
   *     return myPayloadType;
   *   }
   * }
   * ```
   *
   * @param event - The event being dispatched.
   * @returns An array of return payloads, one for each listener that subscribed to the event.
   */
  async async<E>(
    event: E & EventAsyncInstance<E>,
  ): Promise<EventReturnPayload<E>[]> {
    // our result
    let result: EventReturnPayload<E>[];

    try {
      // call async event dispatcher
      // we await the result here in order to catch any exception thrown
      result = await this.eventEmitter.emitAsync(event.key, event);
    } catch (e) {
      throw new EventDispatchException(event, e);
    }

    // final array of results
    return result;
  }
}
