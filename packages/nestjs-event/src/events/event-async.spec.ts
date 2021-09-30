import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_MODULE_EVENT_KEY_PREFIX } from '../event-constants';
import { EventAsync } from './event-async';

describe('EventAsync', () => {
  type TestEventValues = [boolean, number, string];
  class TestEvent extends EventAsync<TestEventValues> {}

  it('should emit event asynchronously', async () => {
    const ee2 = new EventEmitter2();
    const spy = jest.spyOn(ee2, 'emitAsync');
    const testEvent = new TestEvent(true, 1, 'a');
    const listener = jest.fn(async (e: TestEvent) => {
      return e.values;
    });

    ee2.on(testEvent.key, listener);

    expect(await ee2.emitAsync(testEvent.key, testEvent)).toEqual([
      [true, 1, 'a'],
    ]);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      `${EVENT_MODULE_EVENT_KEY_PREFIX}TestEvent`,
      testEvent,
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(testEvent);
  });
});
