import { EventEmitter2 } from 'eventemitter2';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
} from '@rockts-org/nestjs-common';
import { EventOptionsInterface } from './interfaces/event-options.interface';
import { EventDispatchService } from './services/event-dispatch.service';
import { EventListenService } from './services/event-listen.service';
import { EventEmitter2OptionsInterface } from './interfaces/event-emitter2-options.interface';
import {
  EVENT_MODULE_OPTIONS_TOKEN,
  EVENT_MODULE_EMITTER_SERVICE_TOKEN,
} from './event-constants';
import { defaultEmitterConfig } from './config/default-emitter.config';

@Module({
  providers: [Logger, EventListenService, EventDispatchService],
  exports: [EventListenService, EventDispatchService],
})
export class EventModule extends createConfigurableDynamicRootModule<
  EventModule,
  EventOptionsInterface
>(EVENT_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(defaultEmitterConfig)],
  providers: [
    {
      provide: EVENT_MODULE_EMITTER_SERVICE_TOKEN,
      inject: [EVENT_MODULE_OPTIONS_TOKEN, defaultEmitterConfig.KEY],
      useFactory: async (
        options: EventOptionsInterface,
        defaultEmitterOptions: EventEmitter2OptionsInterface,
      ) => {
        return new EventEmitter2(options?.emitter ?? defaultEmitterOptions);
      },
    },
  ],
  exports: [EVENT_MODULE_EMITTER_SERVICE_TOKEN],
}) {
  static register(options: EventOptionsInterface) {
    const module = EventModule.forRoot(EventModule, options);

    module.global = true;

    return module;
  }

  static registerAsync(options: AsyncModuleConfig<EventOptionsInterface>) {
    const module = EventModule.forRootAsync(EventModule, {
      useFactory: () => ({}),
      ...options,
    });

    module.global = true;

    return module;
  }

  static deferred(timeout = 2000) {
    return EventModule.externallyConfigured(EventModule, timeout);
  }
}
