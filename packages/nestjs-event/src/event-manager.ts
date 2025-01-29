import { Logger } from '@nestjs/common';
import { EventException } from './exceptions/event.exception';
import { EventDispatchService } from './services/event-dispatch.service';
import { EventListenService } from './services/event-listen.service';

interface InitializationOptions {
  allowManualShutdown: boolean;
}

/**
 * Single class for managing global access to event services.
 */
export class EventManager {
  /**
   * The singleton instance.
   */
  private static instance: EventManager | undefined;

  /**
   * When toggled on, allows manual shutdown. Primarily used for unit testing.
   */
  private static allowManualShutdown: boolean = false;

  /**
   * Constructor.
   *
   * @param eventDispatchService - Instance of the event dispatch service.
   * @param eventListenService - Instance of the event listen service.
   */
  private constructor(
    private eventDispatchService: EventDispatchService,
    private eventListenService: EventListenService,
  ) {}

  /**
   * Intialize the singleton.
   *
   * Can only be called once per application run, unless manual shutdown is enabled.
   *
   * @param eventDispatchService - Instance of the event dispatch service.
   * @param eventListenService - Instance of the event listen service.
   * @param options - Initialization options.
   */
  public static initialize(
    eventDispatchService: EventDispatchService,
    eventListenService: EventListenService,
    options: InitializationOptions = { allowManualShutdown: false },
  ) {
    // already have an instance?
    if (EventManager.instance) {
      // Log a warning
      // TODO: eventually this should throw an exception
      Logger.warn(`${EventManager.name} has already been initialized.`);
    } else {
      // create new instance
      EventManager.instance = new EventManager(
        eventDispatchService,
        eventListenService,
      );
      // apply manual shutdown setting
      EventManager.allowManualShutdown = options.allowManualShutdown;
    }
  }

  /**
   * Returns the singleton instance.
   */
  public static getInstance(): EventManager {
    if (EventManager.instance instanceof EventManager) {
      return EventManager.instance;
    } else {
      throw new EventException({
        message: `${EventManager.name} has not been initialized.`,
      });
    }
  }

  /**
   * Resets the singleton state to it's default
   */
  private static reset() {
    this.instance = undefined;
    this.allowManualShutdown = false;
  }

  /**
   * Manually shutdown the event manager.
   *
   * Allow manual shutdown must be enabled or an exeption will be thrown.
   */
  public static shutdown() {
    if (this.allowManualShutdown) {
      this.reset();
    } else {
      throw new EventException({
        message: `%s can't be shutdown manually. Manual shutdown has not been enabled.`,
        messageParams: [this.name],
      });
    }
  }

  /**
   * Returns the instance of the event dispatch service.
   */
  static get dispatch(): EventDispatchService {
    return this.getInstance().eventDispatchService;
  }

  /**
   * Returns the instance of the event listen service.
   */
  static get listen(): EventListenService {
    return this.getInstance().eventListenService;
  }

  /**
   * Nest lifecyle event.
   */
  onApplicationShutdown() {
    EventManager.reset();
  }
}
