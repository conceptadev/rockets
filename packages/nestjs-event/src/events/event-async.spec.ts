import { EventEmitter2 } from 'eventemitter2';
import { EVENT_MODULE_EVENT_KEY_PREFIX } from '../event-constants';
import { EventAsync } from './event-async';

describe(EventAsync, () => {
  class TestEvent extends EventAsync<boolean> {}

  it('should emit event asynchronously', async () => {
    const ee2 = new EventEmitter2();
    const spy = jest.spyOn(ee2, 'emitAsync');
    const testEvent = new TestEvent(true);
    const listener = jest.fn(async (e: TestEvent) => {
      return e.payload;
    });

    ee2.on(testEvent.key, listener);

    expect(await ee2.emitAsync(testEvent.key, testEvent)).toEqual([true]);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      `${EVENT_MODULE_EVENT_KEY_PREFIX}TestEvent`,
      testEvent,
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(testEvent);
  });
});
