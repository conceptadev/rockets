import { EventEmitter2 } from 'eventemitter2';
import {
  EVENT_MODULE_EMITTER_SERVICE_TOKEN,
  EVENT_MODULE_OPTIONS_TOKEN,
} from '../event-constants';
import { EventOptionsInterface } from '../interfaces/event-options.interface';
import { Test } from '@nestjs/testing';
import { EventSync } from '../events/event-sync';
import { EventListenerOn } from '../listeners/event-listener-on';
import { EventListenService } from './event-listen.service';
import { EventAsync } from '../events/event-async';
import { EventListenerException } from '../exceptions/event-listener.exception';
import { EventAsyncInterface } from '../events/interfaces/event-async.interface';
import { EventClassInterface } from '../events/interfaces/event-class.interface';

describe('EventListenService', () => {
  const config: EventOptionsInterface = {};
  let eventEmitter: EventEmitter2;
  let eventListenService: EventListenService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: EVENT_MODULE_EMITTER_SERVICE_TOKEN,
          useClass: EventEmitter2,
        },
        EventListenService,
        { provide: EVENT_MODULE_OPTIONS_TOKEN, useValue: config },
      ],
    }).compile();

    eventEmitter = moduleRef.get<EventEmitter2>(
      EVENT_MODULE_EMITTER_SERVICE_TOKEN,
    );
    eventListenService = moduleRef.get<EventListenService>(EventListenService);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be provided', () => {
    expect(eventEmitter).toBeInstanceOf(EventEmitter2);
    expect(eventListenService).toBeInstanceOf(EventListenService);
  });

  describe('on() sync', () => {
    type TestEventValues = [boolean, number, string];
    class TestEvent extends EventSync<TestEventValues> {}
    class TestListenOn extends EventListenerOn<TestEvent> {
      listen(e: TestEvent) {
        e.values; //no-op
      }
    }

    it('should listen to event with sync listener', () => {
      const listener = new TestListenOn();
      const spy = jest.spyOn(eventEmitter, 'on');
      const result = eventListenService.on(TestEvent, listener);
      expect(result).toEqual(undefined);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(TestEvent.key, listener.listen, {
        objectify: true,
      });
    });

    it('should catch emitter exception and wrap it', () => {
      const listener = new TestListenOn();
      const spyEmitter = jest
        .spyOn(eventEmitter, 'on')
        .mockImplementation(() => {
          throw new Error();
        });

      const t = () => {
        eventListenService.on(TestEvent, listener);
      };

      expect(t).toThrow(EventListenerException);
      expect(spyEmitter).toHaveBeenCalledTimes(1);
    });

    it('should catch listener subcription exception and wrap it', () => {
      const listener = new TestListenOn();
      const spySubsc = jest
        .spyOn(listener, 'subscription')
        .mockImplementation(() => {
          throw new Error();
        });

      const t = () => {
        eventListenService.on(TestEvent, listener);
      };

      expect(t).toThrow(EventListenerException);
      expect(spySubsc).toHaveBeenCalledTimes(1);
    });
  });

  describe('on() async', () => {
    type TestEventValues = [boolean, number, string];
    class TestEvent extends EventAsync<TestEventValues> {}

    // const test: Type<EventAsyncInterface<TestEventValues>> = TestEvent;

    const test: EventClassInterface<EventAsyncInterface<TestEventValues>> =
      TestEvent;

    // const test = TestEvent;

    class TestListenOn extends EventListenerOn<TestEvent> {
      async listen(e: TestEvent) {
        return e.values;
      }
    }

    it('should listen to event with async listener', () => {
      const listener = new TestListenOn();
      const spy = jest.spyOn(eventEmitter, 'on');
      // const result = eventListenService.on(TestEvent, listener);
      const result = eventListenService.on(test, listener);
      expect(result).toEqual(undefined);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(TestEvent.key, listener.listen, {
        objectify: true,
      });
    });
  });
});
