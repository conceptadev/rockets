import { EventEmitter2, Listener as EmitterListener } from 'eventemitter2';
import { EventSync } from '../events/event-sync';
import { EventListenerException } from '../exceptions/event-listener.exception';
import { EventListener } from './event-listener';

describe('EventListener', () => {
  type TestValues = [1, 'two', true];
  class TestEvent extends EventSync<TestValues> {}
  class TestListenOn extends EventListener<TestEvent> {
    listen(e: TestEvent): void {
      e.values; // no-op
      return;
    }
  }

  describe('subscription', () => {
    const emitter = new EventEmitter2();
    const listener = new TestListenOn();
    const emitterListener: EmitterListener = emitter.on(
      TestEvent.key,
      listener.listen,
      {
        objectify: true,
      },
    ) as EmitterListener;

    /**
     *
     */
    class MockEmitterListener implements Omit<EmitterListener, 'off'> {
      emitter = emitter;
      event = TestEvent.key;
      listener = listener.listen;
    }

    it('should be a valid emitter', () => {
      expect(emitterListener).toMatchObject<Omit<EmitterListener, 'off'>>(
        new MockEmitterListener(),
      );
    });

    it('should set emitter listener without error', () => {
      expect(listener.subscription(emitterListener)).toEqual(undefined);
    });

    it('should fail to override emitter listener with error', () => {
      const t = () => {
        listener.subscription(emitterListener);
      };
      expect(t).toThrow(EventListenerException);
    });
  });

  describe('remove', () => {
    const emitter = new EventEmitter2();
    const listener = new TestListenOn();
    const emitterListener: EmitterListener = emitter.on(
      TestEvent.key,
      listener.listen,
      {
        objectify: true,
      },
    ) as EmitterListener;

    it('should fail to remove with never subscribed error', () => {
      const t = () => {
        listener.remove();
      };
      expect(t).toThrow(EventListenerException);
      expect(t).toThrow(`Can't remove listener, it has not been subscribed.`);
    });

    it('should call listener off method', () => {
      const spyOff = jest.spyOn(emitterListener, 'off');
      expect(listener.subscription(emitterListener)).toEqual(undefined);
      expect(listener.remove()).toEqual(undefined);
      expect(spyOff).toHaveBeenCalledTimes(1);
    });

    it('should call listener off method and wrap error', () => {
      jest.spyOn(emitterListener, 'off').mockImplementation(() => {
        throw new Error();
      });
      const t = () => {
        listener.remove();
      };
      expect(t).toThrow(EventListenerException);
    });
  });
});
