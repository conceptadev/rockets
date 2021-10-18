import { Global, Module, DynamicModule } from '@nestjs/common';
import { EVENT_MODULE_OPTIONS_TOKEN } from './event-constants';
import { EventConfigOptionsInterface } from './interfaces/event-config-options.interface';

@Global()
@Module({})
export class EventConfigModule {
  /**
   * Register the event config module.
   *
   * @param {EventConfigOptionsInterface} options
   * @returns {DynamicModule}
   */
  static forRoot(options: EventConfigOptionsInterface): DynamicModule {
    return {
      module: EventConfigModule,
      providers: [
        {
          provide: EVENT_MODULE_OPTIONS_TOKEN,
          useValue: options,
        },
      ],
      exports: [EVENT_MODULE_OPTIONS_TOKEN],
    };
  }
}
