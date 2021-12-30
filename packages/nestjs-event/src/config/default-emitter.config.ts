import { registerAs } from '@nestjs/config';
import { ConstructorOptions } from 'eventemitter2';
import { EVENT_MODULE_DEFAULT_EMITTER_SERVICE_SETTINGS_TOKEN } from '../event-constants';

/**
 * Get emitter service config from environment variables.
 */
export const defaultEmitterConfig = registerAs(
  EVENT_MODULE_DEFAULT_EMITTER_SERVICE_SETTINGS_TOKEN,
  (): ConstructorOptions => ({}),
);
