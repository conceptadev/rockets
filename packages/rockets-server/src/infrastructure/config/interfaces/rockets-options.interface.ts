import { RocketsSettingsInterface } from './rockets-settings.interface';
import type { SwaggerUiOptionsInterface } from '@conceptadev/rockets-core';

export interface RocketsOptionsInterface {
  settings?: RocketsSettingsInterface;
  swagger?: SwaggerUiOptionsInterface;
}
