import { Module, DynamicModule, Logger } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventConfigModule } from './event-config.module';
import { EventConfigOptionsInterface } from './interfaces/event-config-options.interface';
import { EventDispatchService } from './services/event-dispatch.service';
import { EventListenService } from './services/event-listen.service';

@Module({
  providers: [Logger, EventListenService, EventDispatchService],
  exports: [EventListenService, EventDispatchService],
})
export class EventModule {
  /**
   * Register the event module
   *
   * @param {EventConfigOptionsInterface} options Event module configuration.
   */
  public static forRoot(options: EventConfigOptionsInterface): DynamicModule {
    return {
      module: EventModule,
      imports: [
        EventConfigModule.forRoot(options),
        EventEmitterModule.forRoot(options.emitter),
      ],
      providers: [Logger, EventListenService, EventDispatchService],
      exports: [EventListenService, EventDispatchService],
    };
  }
}
