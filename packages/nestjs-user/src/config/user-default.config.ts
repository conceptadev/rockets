import { registerAs } from '@nestjs/config';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import { USER_MODULE_DEFAULT_SETTINGS_TOKEN } from '../user.constants';

/**
 * Default configuration for User module.
 */
export const userDefaultConfig = registerAs(
  USER_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): UserSettingsInterface => ({}),
);
