import { EventEmitterModuleOptions } from '@nestjs/event-emitter/dist/interfaces';

/**
 * Event module configuration options interface
 */
export interface EventConfigOptionsInterface {
  /**
   * Event Emitter module options
   *
   * References:
   * NestJS EventEmitter {@link https://docs.nestjs.com/techniques/events}
   * EventEmitter2 Options {@link https://github.com/EventEmitter2/EventEmitter2#differences-non-breaking-compatible-with-existing-eventemitter}
   */
  emitter?: EventEmitterModuleOptions;
}
