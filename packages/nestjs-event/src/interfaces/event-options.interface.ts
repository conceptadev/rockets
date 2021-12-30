import { EventEmitter2OptionsInterface } from './event-emitter2-options.interface';

/**
 * Event module options interface
 */
export interface EventOptionsInterface {
  /**
   * Event Emitter module options
   *
   * References:
   * EventEmitter2 Options {@link https://github.com/EventEmitter2/EventEmitter2#differences-non-breaking-compatible-with-existing-eventemitter}
   */
  emitter?: EventEmitter2OptionsInterface;
}
