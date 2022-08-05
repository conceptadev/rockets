import { Inject, Injectable } from '@nestjs/common';
import {
  EventEmitter2,
  OnOptions,
  Listener as EmitterListener,
} from 'eventemitter2';
import { NotAnErrorException } from '@concepta/ts-core';
import { EventListenerException } from '../exceptions/event-listener.exception';
import { EventListenOnOptionsInterface } from './interfaces/event-listen-on-options.interface';
import { EventListenOnInterface } from './interfaces/event-listen-on.interface';
import { EventClassInterface } from '../events/interfaces/event-class.interface';
import { EVENT_MODULE_EMITTER_SERVICE_TOKEN } from '../event-constants';

/**
 * Event Listen Service
 *
 * This service coordinates the registering of listeners on dispatched events to the NestJS EventEmitter module.
 */
@Injectable()
export class EventListenService {
  /**
   * Constructor
   *
   * @param eventEmitter Injected event emitter instance
   */
  constructor(
    @Inject(EVENT_MODULE_EMITTER_SERVICE_TOKEN)
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Adds a listener to the end of the listeners list for the specified event.
   *
   * See the [EventEmitter2.on](https://github.com/EventEmitter2/EventEmitter2#emitteronevent-listener-options-objectboolean)
   * documentation for more details about the underlying emitter API.
   *
   * ### Example
   * ```ts
   * import { Injectable, OnModuleInit } from '@nestjs/common';
   * import { EventListenService, EventListenerOn } from '@concepta/nestjs-events';
   * import { TargetEvent } from 'target-module';
   *
   * class MyListener extends EventListenerOn<TargetEvent> {
   *   listen(event: TargetEvent) {
   *     console.log(event.payload);
   *   }
   * }
   *
   * @Injectable()
   * class MyClass implements OnModuleInit {
   *   constructor(private eventListenService: EventListenService) {}
   *
   *   onModuleInit() {
   *     // listener instance
   *     const listener = new MyListener();
   *     // register the listener
   *     this.eventListenService.on(TargetEvent, listener);
   *   }
   * }
   * ```
   *
   * @param {EventClassInterface<E>} eventClass  The event class to subscribe to. This is the class, NOT an instance.
   * @param {EventListenOnInterface<E>} listener Instance of the event listener class to attach to the event.
   * @param {EventListenOnOptionsInterface<E>} options Overriding options.
   */
  on<E>(
    eventClass: EventClassInterface<E>,
    listener: EventListenOnInterface<E>,
    options: EventListenOnOptionsInterface = {},
  ): void {
    // override default listener options with options parameter
    const finalOptions: OnOptions = {
      ...listener.options,
      ...options,
      objectify: true,
    };

    // the emitter listener
    let emitterListener: EmitterListener;

    try {
      // emit the event
      emitterListener = this.eventEmitter.on(
        eventClass.key,
        listener.listen,
        finalOptions,
      ) as EmitterListener;
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      // rethrow wrapped
      throw new EventListenerException(exception.message);
    }

    try {
      // inform listener of the subscription
      listener.subscription(emitterListener);
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      // rethrow wrapped
      throw new EventListenerException(exception.message);
    }
  }
}
