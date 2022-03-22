import { registerAs } from '@nestjs/config';
import { ExtractJwt } from '@concepta/nestjs-jwt';
import { AUTH_JWT_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-jwt.constants';
import { AuthJwtSettingsInterface } from '../interfaces/auth-jwt-settings.interface';

/**
 * Default configuration for auth local.
 */
export const authJwtDefaultConfig = registerAs(
  AUTH_JWT_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): Partial<AuthJwtSettingsInterface> => ({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  }),
);
