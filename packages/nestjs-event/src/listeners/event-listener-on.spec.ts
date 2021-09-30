import { EventSync } from '../events/event-sync';
import { EventListenerOn } from './event-listener-on';

describe('EventListenerOn', () => {
  type TestValues = [1, 'two', true];
  class TestEvent extends EventSync<TestValues> {}
  class TestListenOn extends EventListenerOn<TestEvent> {
    listen(e: TestEvent): void {
      e.values; // no-op
      return;
    }
  }

  describe('options', () => {
    it('should be empty object', () => {
      const listener = new TestListenOn();
      expect(listener.options).toEqual({});
    });

    it('should match constructed value', () => {
      const listener = new TestListenOn({ async: true });
      expect(listener.options).toEqual({ async: true });
    });
  });
});
