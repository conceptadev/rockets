import { Test } from '@nestjs/testing';
import { EventConfigModule } from './event-config.module';
import { EVENT_MODULE_OPTIONS_TOKEN } from './event-constants';
import { EventConfigOptionsInterface } from './interfaces/event-config-options.interface';

describe('EventModule', () => {
  let eventConfig: EventConfigOptionsInterface;

  beforeEach(async () => {
    eventConfig = {
      emitter: { maxListeners: 5 },
    };
  });

  describe('forRoot', () => {
    it('should import the dynamic module', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EventConfigModule.forRoot(eventConfig)],
      }).compile();

      const eventConfigResult = moduleRef.get(EVENT_MODULE_OPTIONS_TOKEN);

      expect(eventConfigResult).toEqual(eventConfig);
    });
  });
});
