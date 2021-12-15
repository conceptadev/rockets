import { DynamicModule, Global, Module } from '@nestjs/common';

import { EVENT_MODULE_OPTIONS_TOKEN } from './event-constants';
import { EventConfigOptionsInterface } from './interfaces/event-config-options.interface';

@Global()
@Module({
  providers: [
    {
      provide: EVENT_MODULE_OPTIONS_TOKEN,
      useValue: { why: true },
    },
  ],
  exports: [EVENT_MODULE_OPTIONS_TOKEN],
})
export class EventConfigModule {
  /**
   * Register the event config module.
   *
   * @param {EventConfigOptionsInterface} options Event configuration options.
   * @returns {DynamicModule} Dynamic module
   */
  static forRoot(options: EventConfigOptionsInterface): DynamicModule {
    return {
      global: options?.global ? options.global : true,
      module: EventConfigModule,
      providers: [
        {
          provide: EVENT_MODULE_OPTIONS_TOKEN,
          useValue: options ?? { why: true },
        },
      ],
      exports: [EVENT_MODULE_OPTIONS_TOKEN],
    };
  }
}
