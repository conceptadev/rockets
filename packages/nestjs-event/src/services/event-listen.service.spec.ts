import { EventEmitter2 } from 'eventemitter2';
import { Test } from '@nestjs/testing';
import {
  EVENT_MODULE_EMITTER_SERVICE_TOKEN,
  EVENT_MODULE_OPTIONS_TOKEN,
} from '../event-constants';
import { EventOptionsInterface } from '../interfaces/event-options.interface';
import { EventSync } from '../events/event-sync';
import { EventListenerOn } from '../listeners/event-listener-on';
import { EventListenService } from './event-listen.service';
import { EventAsync } from '../events/event-async';
import { EventListenException } from '../exceptions/event-listen.exception';

describe(EventListenService, () => {
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

  describe(EventListenService.prototype.on, () => {
    describe('sync', () => {
      class TestEvent extends EventSync<number> {}
      class TestListenOn extends EventListenerOn<TestEvent> {
        listen(e: TestEvent) {
          e.payload; // no-op
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

        expect(t).toThrow(EventListenException);
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

        expect(t).toThrow(EventListenException);
        expect(spySubsc).toHaveBeenCalledTimes(1);
      });
    });

    describe('async', () => {
      class TestEvent extends EventAsync<string> {}

      class TestListenOn extends EventListenerOn<TestEvent> {
        async listen(e: TestEvent) {
          return e.payload;
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
});
