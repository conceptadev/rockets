import { registerAs } from '@nestjs/config';
import { ROCKETS_CORE_SETTINGS_TOKEN } from '@conceptadev/rockets-core';
import { RocketsSettingsInterface } from './interfaces/rockets-settings.interface';

export const rocketsOptionsDefaultConfig = registerAs(
  ROCKETS_CORE_SETTINGS_TOKEN,
  (): RocketsSettingsInterface => ({}),
);
