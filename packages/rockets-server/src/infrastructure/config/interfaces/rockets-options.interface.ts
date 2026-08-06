import { RocketsSettingsInterface } from './rockets-settings.interface';
import type { SwaggerUiOptionsInterface } from '@concepta/rockets-core';

export interface RocketsOptionsInterface {
  settings?: RocketsSettingsInterface;
  swagger?: SwaggerUiOptionsInterface;
}
