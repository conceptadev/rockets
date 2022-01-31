import { registerAs } from '@nestjs/config';
import { REFRESH_TOKEN_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-refresh.constants';
import { AuthRefreshSettingsInterface } from '../interfaces/auth-refresh-settings.interface';

/**
 * Default configuration for auth local.
 */
export const authRefreshDefaultConfig = registerAs(
  REFRESH_TOKEN_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): AuthRefreshSettingsInterface => ({}),
);
