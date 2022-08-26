import { DynamicModule, Logger, Module } from '@nestjs/common';

import {
  EventAsyncOptions,
  EventModuleClass,
  EventOptions,
} from './event.module-definition';
import { EventDispatchService } from './services/event-dispatch.service';
import { EventListenService } from './services/event-listen.service';

/**
 * Event module
 */
@Module({
  providers: [Logger, EventListenService, EventDispatchService],
  exports: [EventListenService, EventDispatchService],
})
export class EventModule extends EventModuleClass {
  static forRoot(options: EventOptions): DynamicModule {
    return super.forRoot({ ...options, global: true });
  }

  static forRootAsync(options: EventAsyncOptions): DynamicModule {
    return super.forRootAsync({ ...options, global: true });
  }
}
