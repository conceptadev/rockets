import { AuthLocalOptionsInterface } from '../interfaces/auth-local-options.interface';
import { registerAs } from '@nestjs/config';

export const GET_USER_SERVICE_TOKEN = 'GET_USER_SERVICE_TOKEN';
export const ISSUE_TOKEN_SERVICE_TOKEN = 'ISSUE_TOKEN_SERVICE_TOKEN';

export const AUTH_LOCAL_MODULE_OPTIONS_TOKEN = 'AUTH_LOCAL_MODULE_OPTIONS';

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
export const authLocalOptions = registerAs(
  AUTH_LOCAL_MODULE_OPTIONS_TOKEN,
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
