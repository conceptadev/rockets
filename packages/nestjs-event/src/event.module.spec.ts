import { Test } from '@nestjs/testing';
import { EventModule } from './event.module';
import { EventOptionsInterface } from './interfaces/event-options.interface';
import { EventDispatchService } from './services/event-dispatch.service';
import { EventListenService } from './services/event-listen.service';

describe('EventModule', () => {
  let eventConfig: EventOptionsInterface;

  beforeEach(async () => {
    eventConfig = {
      emitter: {},
    };
  });

  describe('forRoot', () => {
    it('should always return a global module', async () => {
      const module = EventModule.register(eventConfig);

      expect(module.global).toStrictEqual(true);
    });

    it('should import the dynamic module', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EventModule.register(eventConfig)],
      }).compile();

      const eventDispatchService =
        moduleRef.get<EventDispatchService>(EventDispatchService);
      const eventListenService =
        moduleRef.get<EventListenService>(EventListenService);

      expect(eventDispatchService).toBeInstanceOf(EventDispatchService);
      expect(eventListenService).toBeInstanceOf(EventListenService);
    });
  });

  describe('forRootAsync', () => {
    it('should always return a global module', async () => {
      const module = EventModule.registerAsync({
        useFactory: () => eventConfig,
      });

      expect(module.global).toStrictEqual(true);
    });

    it('should import the dynamic module', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EventModule.registerAsync({ useFactory: () => eventConfig })],
      }).compile();

      const eventDispatchService =
        moduleRef.get<EventDispatchService>(EventDispatchService);
      const eventListenService =
        moduleRef.get<EventListenService>(EventListenService);

      expect(eventDispatchService).toBeInstanceOf(EventDispatchService);
      expect(eventListenService).toBeInstanceOf(EventListenService);
    });

    it('should import the dynamic module (empty cnfig)', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EventModule.registerAsync({})],
      }).compile();

      const eventDispatchService =
        moduleRef.get<EventDispatchService>(EventDispatchService);
      const eventListenService =
        moduleRef.get<EventListenService>(EventListenService);

      expect(eventDispatchService).toBeInstanceOf(EventDispatchService);
      expect(eventListenService).toBeInstanceOf(EventListenService);
    });
  });

  describe('deferred', () => {
    it('should return the dynamic module (deferred)', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EventModule.deferred(), EventModule.register(eventConfig)],
      }).compile();

      const eventDispatchService =
        moduleRef.get<EventDispatchService>(EventDispatchService);
      const eventListenService =
        moduleRef.get<EventListenService>(EventListenService);

      expect(eventDispatchService).toBeInstanceOf(EventDispatchService);
      expect(eventListenService).toBeInstanceOf(EventListenService);
    });
  });
});
