import { registerAs } from '@nestjs/config';
import { AUTH_LOCAL_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-local.constants';
import { AuthLocalSettingsInterface } from '../interfaces/auth-local-settings.interface';

/**
 * Default configuration for auth local.
 */
export const authLocalDefaultConfig = registerAs(
  AUTH_LOCAL_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): AuthLocalSettingsInterface => ({
    /**
     * The field name to use for the username.
     */
    usernameField: process.env.AUTH_LOCAL_USERNAME_FIELD ?? 'username',
    /**
     * The field name to use for the password.
     */
    passwordField: process.env.AUTH_LOCAL_PASSWORD_FIELD ?? 'password',
  }),
);
