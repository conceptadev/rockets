import { registerAs } from '@nestjs/config';
import { AUTH_LOCAL_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-local.constants';
import { AuthLocalSettingsInterface } from '../interfaces/auth-local-settings.interface';
import { AuthLocalLoginDto } from '../dto/auth-local-login.dto';

/**
 * Default configuration for auth local.
 */
export const authLocalDefaultConfig = registerAs(
  AUTH_LOCAL_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): AuthLocalSettingsInterface => ({
    /**
     * The login dto
     */
    loginDto: AuthLocalLoginDto,
    /**
     * The field name to use for the username.
     */
    usernameField: process.env.AUTH_LOCAL_USERNAME_FIELD ?? 'username',
    /**
     * The field name to use for the password.
     */
    passwordField: process.env.AUTH_LOCAL_PASSWORD_FIELD ?? 'password',
    /**
     * The maximum number of login attempts allowed before account is locked
     */
    maxAttempts: process.env?.AUTH_LOCAL_MAX_ATTEMPT
      ? Number(process.env?.AUTH_LOCAL_MAX_ATTEMPT)
      : 10,
    /**
     * The minimum number of login attempts to be allowed before account is locked
     */
    minAttempts: process.env?.AUTH_LOCAL_MIN_ATTEMPT
      ? Number(process.env?.AUTH_LOCAL_MIN_ATTEMPT)
      : 3,
  }),
);
