import { EventAsync } from '../events/event-async';
import { EventSync } from '../events/event-sync';
import { EventListenerOn } from './event-listener-on';

describe(EventListenerOn, () => {
  describe('options', () => {
    class TestEvent extends EventSync {}
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

  describe(EventSync, () => {
    class TestEvent extends EventSync<number> {}
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
});
