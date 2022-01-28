import { registerAs } from '@nestjs/config';
import { REFRESH_TOKEN_MODULE_DEFAULT_SETTINGS_TOKEN } from '../refresh-token.constants';
import { RefreshTokenSettingsInterface } from '../interfaces/refresh-token-settings.interface';

/**
 * Default configuration for auth local.
 */
export const refreshTokenDefaultConfig = registerAs(
  REFRESH_TOKEN_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): RefreshTokenSettingsInterface => ({
    
  }),
);
