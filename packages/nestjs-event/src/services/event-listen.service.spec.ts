import { EVENT_MODULE_OPTIONS_TOKEN } from '../event-constants';
import { EventConfigOptionsInterface } from '../interfaces/event-config-options.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { EventSync } from '../events/event-sync';
import { EventListenerOn } from '../listeners/event-listener-on';
import { EventListenService } from './event-listen.service';
import { EventAsync } from '../events/event-async';
import { EventListenerException } from '../exceptions/event-listener.exception';

describe('EventListenService', () => {
  const config: EventConfigOptionsInterface = {};
  let eventEmitter: EventEmitter2;
  let eventListenService: EventListenService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        EventListenService,
        { provide: EVENT_MODULE_OPTIONS_TOKEN, useValue: config },
      ],
    }).compile();

    eventEmitter = moduleRef.get<EventEmitter2>(EventEmitter2);
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
    class TestListenOn extends EventListenerOn<TestEvent> {
      async listen(e: TestEvent) {
        return e.values;
      }
    }

    it('should listen to event with async listener', () => {
      const listener = new TestListenOn();
      const spy = jest.spyOn(eventEmitter, 'on');
      const result = eventListenService.on(TestEvent, listener);
      expect(result).toEqual(undefined);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(TestEvent.key, listener.listen, {
        objectify: true,
      });
    });
  });
});
