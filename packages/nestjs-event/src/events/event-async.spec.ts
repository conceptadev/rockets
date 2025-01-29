import { EventEmitter2 } from 'eventemitter2';
import { EVENT_MODULE_EVENT_KEY_PREFIX } from '../event-constants';
import { EventManager } from '../event-manager';
import { EventListenerOn } from '../listeners/event-listener-on';
import { EventDispatchService } from '../services/event-dispatch.service';
import { EventListenService } from '../services/event-listen.service';
import { EventAsync } from './event-async';

describe(EventAsync, () => {
  class TestEvent extends EventAsync<boolean> {}
  class TestListener extends EventListenerOn<TestEvent> {
    async listen(e: TestEvent): Promise<boolean> {
      return e.payload;
    }
  }

  let ee2: EventEmitter2;
  let testEvent: TestEvent;
  let listener: TestListener;

  beforeEach(() => {
    ee2 = new EventEmitter2();
    testEvent = new TestEvent(true);
    listener = new TestListener();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should emit an async event', async () => {
    const spyEmit = jest.spyOn(ee2, 'emitAsync');
    const spyListen = jest.spyOn(listener, 'listen');
    ee2.on(testEvent.key, listener.listen);

    expect(await ee2.emitAsync(testEvent.key, testEvent)).toEqual([true]);
    expect(spyEmit).toHaveBeenCalledTimes(1);
    expect(spyEmit).toHaveBeenCalledWith(
      `${EVENT_MODULE_EVENT_KEY_PREFIX}TestEvent`,
      testEvent,
    );

    expect(spyListen).toHaveBeenCalledTimes(1);
    expect(spyListen).toHaveBeenCalledWith(testEvent);
  });

  it(EventAsync.prototype.emit.name, async () => {
    const ee2 = new EventEmitter2();
    const testEvent = new TestEvent(true);
    const testListener = new TestListener();
    const spyEmit = jest.spyOn(ee2, 'emitAsync');
    const spyListen = jest.spyOn(testListener, 'listen');
    const listenService = new EventListenService(ee2);
    const dispatchService = new EventDispatchService(ee2);
    EventManager.initialize(dispatchService, listenService, {
      allowManualShutdown: true,
    });

    testListener.on(TestEvent);

    expect(await testEvent.emit()).toEqual([true]);
    expect(spyEmit).toHaveBeenCalledTimes(1);
    expect(spyEmit).toHaveBeenCalledWith(
      `${EVENT_MODULE_EVENT_KEY_PREFIX}TestEvent`,
      testEvent,
    );

    expect(spyListen).toHaveBeenCalledTimes(1);
    expect(spyListen).toHaveBeenCalledWith(testEvent);

    EventManager.shutdown();
  });
});
