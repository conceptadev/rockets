import { EventEmitter2 } from 'eventemitter2';
import { EVENT_MODULE_EVENT_KEY_PREFIX } from '../event-constants';
import { EventManager } from '../event-manager';
import { EventListenerOn } from '../listeners/event-listener-on';
import { EventDispatchService } from '../services/event-dispatch.service';
import { EventListenService } from '../services/event-listen.service';
import { Event } from './event';

describe(Event, () => {
  class TestEvent extends Event<boolean> {}
  class TestListener extends EventListenerOn<TestEvent> {
    listen(_event: TestEvent): void {}
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

  it('should emit an event', () => {
    const spyEmit = jest.spyOn(ee2, 'emit');
    const spyListen = jest.spyOn(listener, 'listen');
    ee2.on(testEvent.key, listener.listen);

    expect(ee2.emit(testEvent.key, testEvent)).toEqual(true);
    expect(spyEmit).toHaveBeenCalledTimes(1);
    expect(spyEmit).toHaveBeenCalledWith(
      `${EVENT_MODULE_EVENT_KEY_PREFIX}TestEvent`,
      testEvent,
    );

    expect(spyListen).toHaveBeenCalledTimes(1);
    expect(spyListen).toHaveBeenCalledWith(testEvent);
  });

  it(Event.prototype.emit.name, () => {
    const ee2 = new EventEmitter2();
    const testEvent = new TestEvent(true);
    const listener = new TestListener();
    const spyEmit = jest.spyOn(ee2, 'emit');
    const spyListen = jest.spyOn(listener, 'listen');
    const listenService = new EventListenService(ee2);
    const dispatchService = new EventDispatchService(ee2);
    EventManager.initialize(dispatchService, listenService, {
      allowManualShutdown: true,
    });
    EventManager.listen.on(TestEvent, listener);

    expect(testEvent.emit()).toEqual(true);
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
