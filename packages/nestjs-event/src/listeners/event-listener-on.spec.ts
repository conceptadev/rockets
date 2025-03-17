import EventEmitter2 from 'eventemitter2';
import { EventManager } from '../event-manager';
import { Event } from '../events/event';
import { EventAsync } from '../events/event-async';
import { EventDispatchService } from '../services/event-dispatch.service';
import { EventListenService } from '../services/event-listen.service';
import { EventListenerOn } from './event-listener-on';

describe(EventListenerOn, () => {
  describe('options', () => {
    class TestEvent extends Event {}
    class TestListenOn extends EventListenerOn<TestEvent> {
      listen(): void {
        return;
      }
    }

    it('should be empty object', () => {
      const listener = new TestListenOn();
      expect(listener.options).toEqual({});
    });

    it('should match constructed payload', () => {
      const listener = new TestListenOn({ async: true });
      expect(listener.options).toEqual({ async: true });
    });
  });

  describe(Event, () => {
    class TestEvent extends Event<number> {}
    let eventPayload: number | undefined;

    class TestListenOn extends EventListenerOn<TestEvent> {
      listen(e: TestEvent): void {
        eventPayload = e.payload;
        return;
      }
    }

    it('payload should be correct', () => {
      const listener = new TestListenOn({ async: true });
      listener.listen(new TestEvent(123));
      expect(eventPayload).toEqual(123);
    });
  });

  describe(EventAsync, () => {
    class TestEvent extends EventAsync<number> {}
    let eventPayload: number | undefined;

    class TestListenOn extends EventListenerOn<TestEvent> {
      async listen(e: TestEvent): Promise<number> {
        eventPayload = e.payload;
        return 789;
      }
    }

    it('payload should be correct', () => {
      const listener = new TestListenOn({ async: true });
      listener.listen(new TestEvent(456));
      expect(eventPayload).toEqual(456);
    });
  });

  describe(EventListenerOn.prototype.on.name, () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    class TestEvent extends EventAsync<number, boolean> {}

    class TestListenerOn extends EventListenerOn<TestEvent> {
      async listen(e: TestEvent): Promise<boolean> {
        return e.payload > 567;
      }
    }

    it('Should call the listener service', () => {
      EventManager['instance'] = undefined;
      const ee2 = new EventEmitter2();
      const listener = new TestListenerOn();
      const listenService = new EventListenService(ee2);
      const dispatchService = new EventDispatchService(ee2);
      const spyListenOn = jest.spyOn(listenService, 'on');
      EventManager.initialize(dispatchService, listenService);
      listener.on(TestEvent);
      expect(spyListenOn).toHaveBeenCalledTimes(1);
    });
  });
});
