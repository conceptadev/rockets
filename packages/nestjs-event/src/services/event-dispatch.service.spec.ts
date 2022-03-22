import {
  EVENT_MODULE_EMITTER_SERVICE_TOKEN,
  EVENT_MODULE_OPTIONS_TOKEN,
} from '../event-constants';
import { EventAsync } from '../events/event-async';
import { EventOptionsInterface } from '../interfaces/event-options.interface';
import { EventDispatchService } from './event-dispatch.service';
import { EventEmitter2 } from 'eventemitter2';
import { Test } from '@nestjs/testing';
import { EventSync } from '../events/event-sync';
import { EventDispatchException } from '../exceptions/event-dispatch.exception';

describe('EventDispatchService', () => {
  const config: EventOptionsInterface = {};
  let eventEmitter: EventEmitter2;
  let eventDispatchService: EventDispatchService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: EVENT_MODULE_EMITTER_SERVICE_TOKEN,
          useClass: EventEmitter2,
        },
        EventDispatchService,
        { provide: EVENT_MODULE_OPTIONS_TOKEN, useValue: config },
      ],
    }).compile();

    eventEmitter = moduleRef.get<EventEmitter2>(
      EVENT_MODULE_EMITTER_SERVICE_TOKEN,
    );
    eventDispatchService =
      moduleRef.get<EventDispatchService>(EventDispatchService);
  });

  it('should be provided', () => {
    expect(eventEmitter).toBeInstanceOf(EventEmitter2);
    expect(eventDispatchService).toBeInstanceOf(EventDispatchService);
  });

  describe('sync()', () => {
    type TestEventValues = [boolean, number, string];
    class TestEvent extends EventSync<TestEventValues> {}

    it('should emit event with no listener', async () => {
      const testEvent = new TestEvent(true, 1, 'a');
      const spy = jest.spyOn(eventEmitter, 'emit');

      const result: boolean = eventDispatchService.sync(testEvent);

      expect(result).toEqual(false);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(testEvent.key, testEvent);
    });

    it('should emit event with one listener', async () => {
      const testEvent = new TestEvent(true, 1, 'a');
      const spy = jest.spyOn(eventEmitter, 'emit');

      const listener = jest.fn((e: TestEvent) => {
        return e.values;
      });
      eventEmitter.on(testEvent.key, listener);

      const result: boolean = eventDispatchService.sync(testEvent);

      expect(result).toEqual(true);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(testEvent.key, testEvent);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(testEvent);
    });

    it('should catch exception', async () => {
      const testEvent = new TestEvent(true, 1, 'a');

      const listener = jest.fn(() => {
        throw new Error();
      });
      eventEmitter.on(testEvent.key, listener);

      const t = () => {
        eventDispatchService.sync(testEvent);
      };

      expect(t).toThrow(EventDispatchException);
    });
  });

  describe('async()', () => {
    type TestEventValues = [boolean, number, string];
    class TestEvent extends EventAsync<TestEventValues> {}

    it('should emit an async event with no listener', async () => {
      const testEvent = new TestEvent(true, 1, 'a');
      const spy = jest.spyOn(eventEmitter, 'emitAsync');

      const result: TestEventValues[] = await eventDispatchService.async(
        testEvent,
      );

      expect(result).toEqual([]);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(testEvent.key, testEvent);
    });

    it('should emit an async event with one listener', async () => {
      const testEvent = new TestEvent(true, 1, 'a');
      const spy = jest.spyOn(eventEmitter, 'emitAsync');

      const listener = jest.fn(async (e: TestEvent) => {
        return e.values;
      });
      eventEmitter.on(testEvent.key, listener);

      const result: TestEventValues[] = await eventDispatchService.async(
        testEvent,
      );

      expect(result).toEqual([[true, 1, 'a']]);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(testEvent.key, testEvent);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(testEvent);
    });

    it('should catch exception', async () => {
      const testEvent = new TestEvent(true, 1, 'a');

      const listener = jest.fn(() => {
        throw new Error();
      });
      eventEmitter.on(testEvent.key, listener);

      expect(eventDispatchService.async(testEvent)).rejects.toThrowError(
        EventDispatchException,
      );
    });
  });
});
