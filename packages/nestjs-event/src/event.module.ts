import { DynamicModule, Module } from '@nestjs/common';

import {
  EventAsyncOptions,
  EventModuleClass,
  EventOptions,
} from './event.module-definition';

/**
 * Event module
 */
@Module({})
export class EventModule extends EventModuleClass {
  static forRoot(options: EventOptions): DynamicModule {
    return super.forRoot({ ...options, global: true });
  }

  static forRootAsync(options: EventAsyncOptions): DynamicModule {
    return super.forRootAsync({ ...options, global: true });
  }
}
