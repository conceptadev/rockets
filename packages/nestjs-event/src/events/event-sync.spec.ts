import { EventEmitter2 } from 'eventemitter2';
import { EVENT_MODULE_EVENT_KEY_PREFIX } from '../event-constants';
import { Event } from './event';
import { EventSync } from './event-sync';

describe(Event, () => {
  class TestEvent extends EventSync<boolean> {}

  it('should emit an event', () => {
    const ee2 = new EventEmitter2();
    const spy = jest.spyOn(ee2, 'emit');
    const testEvent = new TestEvent(true);

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
