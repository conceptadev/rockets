import { registerAs } from '@nestjs/config';
import { ExtractJwt } from '../jwt/index';
import { AUTH_JWT_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-jwt/auth-jwt.constants';
import { AuthJwtSettingsInterface } from '../auth-jwt/interfaces/auth-jwt-settings.interface';

/**
 * Default configuration for auth local.
 */
export const authJwtDefaultConfig = registerAs(
  AUTH_JWT_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): Partial<AuthJwtSettingsInterface> => ({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  }),
);
