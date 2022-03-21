import { registerAs } from '@nestjs/config';
import { AccessControlSettingsInterface } from '../interfaces/access-control-settings.interface';
import { ACCESS_CONTROL_MODULE_DEFAULT_SETTINGS_TOKEN } from '../constants';

/**
 * Default configuration for access control.
 */
export const accessControlDefaultConfig = registerAs(
  ACCESS_CONTROL_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): Partial<AccessControlSettingsInterface> => ({}),
);
