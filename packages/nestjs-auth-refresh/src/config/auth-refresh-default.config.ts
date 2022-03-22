import { registerAs } from '@nestjs/config';
import { ExtractJwt } from '@concepta/nestjs-jwt';
import { REFRESH_TOKEN_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-refresh.constants';
import { AuthRefreshSettingsInterface } from '../interfaces/auth-refresh-settings.interface';

/**
 * Default configuration for auth refresh.
 */
export const authRefreshDefaultConfig = registerAs(
  REFRESH_TOKEN_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): Partial<AuthRefreshSettingsInterface> => ({
    jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
  }),
);
