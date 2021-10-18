import { Test } from '@nestjs/testing';
import { EventModule } from './event.module';
import { EventConfigOptionsInterface } from './interfaces/event-config-options.interface';
import { EventDispatchService } from './services/event-dispatch.service';
import { EventListenService } from './services/event-listen.service';

describe('EventModule', () => {
  let eventConfig: EventConfigOptionsInterface;

  beforeEach(async () => {
    eventConfig = {
      emitter: {},
    };
  });

  describe('forRoot', () => {
    it('should import the dynamic module', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EventModule.forRoot(eventConfig)],
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
