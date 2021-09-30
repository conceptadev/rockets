import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_MODULE_EVENT_KEY_PREFIX } from '../event-constants';
import { EventSync } from './event-sync';

describe('Event', () => {
  type TestEventValues = [boolean, number, string];
  class TestEvent extends EventSync<TestEventValues> {}

  it('should emit an event', () => {
    const ee2 = new EventEmitter2();
    const spy = jest.spyOn(ee2, 'emit');
    const testEvent = new TestEvent(true, 1, 'a');

    const listener = jest.fn((v) => v);
    ee2.on(testEvent.key, listener);

    expect(ee2.emit(testEvent.key, testEvent)).toEqual(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      `${EVENT_MODULE_EVENT_KEY_PREFIX}TestEvent`,
      testEvent,
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(testEvent);
  });
});
