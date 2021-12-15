import { DynamicModule, Global, Logger, Module } from '@nestjs/common';

import { EventConfigModule } from './event-config.module';
import { EventConfigOptionsInterface } from './interfaces/event-config-options.interface';
import { EventDispatchService } from './services/event-dispatch.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventListenService } from './services/event-listen.service';

@Global()
@Module({
  imports: [EventConfigModule, EventEmitterModule.forRoot()],
  providers: [Logger, EventListenService, EventDispatchService],
  exports: [EventListenService, EventDispatchService],
})
export class EventModule {
  /**
   * Register the event module
   *
   * @param {EventConfigOptionsInterface} options Event module configuration.
   * @returns {DynamicModule} Dynamic event module.
   */
  public static forRoot(options: EventConfigOptionsInterface): DynamicModule {
    return {
      global: options?.global ? options.global : true,
      module: EventModule,
      imports: [
        EventConfigModule.forRoot(options),
        EventEmitterModule.forRoot(options.emitter),
      ],
    };
  }
}
