import { registerAs } from '@nestjs/config';
import { AuthLocalOptionsInterface as AuthLocalOptionsInterface } from '../interfaces/auth-local-options.interface';

export const GET_USER_SERVICE_TOKEN = 'GET_USER_SERVICE_TOKEN';
export const ISSUE_TOKEN_SERVICE_TOKEN = 'ISSUE_TOKEN_SERVICE_TOKEN';

export const AUTH_LOCAL_MODULE_CONFIG_TOKEN = 'AUTH_LOCAL_MODULE_CONFIG_TOKEN';

/**
 * Configuration for auth local.
 *
 * ### example
 * ```ts
 *
 *
 *
 *
 *
 *
 * ```
 */
export const authLocalConfig = registerAs(
  AUTH_LOCAL_MODULE_CONFIG_TOKEN,
  (): AuthLocalOptionsInterface => ({
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
