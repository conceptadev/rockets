import { registerAs } from '@nestjs/config';
import { ROLE_MODULE_DEFAULT_SETTINGS_TOKEN } from '../role.constants';
import { RoleSettingsInterface } from '../interfaces/role-settings.interface';

/**
 * Default configuration for Role module.
 */
export const roleDefaultConfig = registerAs(
  ROLE_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): Partial<RoleSettingsInterface> => ({}),
);
