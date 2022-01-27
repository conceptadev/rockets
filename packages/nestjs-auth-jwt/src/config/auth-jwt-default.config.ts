import { registerAs } from '@nestjs/config';
import { AUTH_JWT_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-jwt.constants';
import { AuthJwtSettingsInterface } from '../interfaces/auth-jwt-settings.interface';

/**
 * Default configuration for auth local.
 */
export const authJwtDefaultConfig = registerAs(
  AUTH_JWT_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): AuthJwtSettingsInterface => ({
    ignoreExpiration: process.env.AUTH_JWT_IGNORE_EXPIRATION_FIELD
      ? Boolean(process.env.AUTH_JWT_IGNORE_EXPIRATION_FIELD)
      : false,

    secretOrKey: process.env.AUTH_JWT_SECRET_FIELD ?? 'secret',
  }),
);
