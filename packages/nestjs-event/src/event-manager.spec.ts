import EventEmitter2 from 'eventemitter2';
import { EventManager } from './event-manager';
import { EventDispatchService } from './services/event-dispatch.service';
import { EventListenService } from './services/event-listen.service';
import { EventException } from './exceptions/event.exception';
import { Logger } from '@nestjs/common';

describe(EventManager, () => {
  let emitterInstance: EventEmitter2;
  let listenService: EventListenService;
  let dispatchService: EventDispatchService;

  beforeEach(async () => {
    emitterInstance = new EventEmitter2();
    listenService = new EventListenService(emitterInstance);
    dispatchService = new EventDispatchService(emitterInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`${EventManager.initialize.name} should throw not initialized exception`, async () => {
    const t = () => {
      EventManager.getInstance();
    };
    expect(t).toThrow(EventException);
    expect(t).toThrow(`${EventManager.name} has not been initialized.`);
  });

  it(`${EventManager.initialize.name} should throw already initialized exception`, async () => {
    const spyLoggerWarn = jest.spyOn(Logger, 'warn');

    EventManager.initialize(dispatchService, listenService, {
      allowManualShutdown: true,
    });

    EventManager.initialize(dispatchService, listenService);

    expect(spyLoggerWarn).toHaveBeenCalledTimes(1);
    expect(spyLoggerWarn).toHaveBeenCalledWith(
      `${EventManager.name} has already been initialized.`,
    );
    EventManager.shutdown();
  });

  it(`${EventManager.initialize.name} should NOT enable allow manual shutdown`, async () => {
    EventManager.initialize(dispatchService, listenService);

    expect(EventManager['allowManualShutdown']).toEqual(false);
    EventManager['instance'] = undefined;
  });

  it(`${EventManager.initialize.name} should enable allow manual shutdown`, async () => {
    EventManager.initialize(dispatchService, listenService, {
      allowManualShutdown: true,
    });

    expect(EventManager['allowManualShutdown']).toEqual(true);
    EventManager.shutdown();
  });

  it(`${EventManager.initialize.name} should initialize the singleton instance`, async () => {
    EventManager.initialize(dispatchService, listenService, {
      allowManualShutdown: true,
    });

    const eventManager = EventManager.getInstance();
    expect(eventManager).toBeInstanceOf(EventManager);
    expect(EventManager.dispatch).toStrictEqual(dispatchService);
    expect(EventManager.listen).toStrictEqual(listenService);
    EventManager.shutdown();
  });

  it(`${EventManager.shutdown.name} should reset the singleton to default state`, async () => {
    EventManager.initialize(dispatchService, listenService, {
      allowManualShutdown: true,
    });
    EventManager.shutdown();

    expect(EventManager['allowManualShutdown']).toEqual(false);
    expect(EventManager['instance']).toEqual(undefined);
  });

  it(`${EventManager.shutdown.name} should fail if allow manual shutdown is not enabled`, async () => {
    EventManager.initialize(dispatchService, listenService);
    const t = () => {
      EventManager.shutdown();
    };
    expect(t).toThrow(EventException);
    expect(t).toThrow(
      `${EventManager.name} can't be shutdown manually. Manual shutdown has not been enabled.`,
    );
  });

  it(`${EventManager.prototype.onApplicationShutdown.name} should reset the singleton to default state`, async () => {
    EventManager.initialize(dispatchService, listenService, {
      allowManualShutdown: true,
    });
    const eventManager = EventManager.getInstance();

    eventManager.onApplicationShutdown();

    expect(EventManager['allowManualShutdown']).toEqual(false);
    expect(EventManager['instance']).toEqual(undefined);
  });
});
