import {
  ConfigFactory,
  ConfigFactoryKeyHost,
  registerAs,
} from '@nestjs/config';

import { AuthenticationConfigOptionsInterface } from '../interfaces/authentication-config-options.interface';

/**
 * The token to which all Authentication module options are set.
 */
export const AUTHENTICATION_MODULE_CONFIG_TOKEN =
  'AUTHENTICATION_MODULE_CONFIG';

export const CREDENTIAL_LOOKUP_SERVICE_TOKEN = 'CREDENTIAL_LOOKUP_SERVICE';
export const PASSWORD_STORAGE_SERVICE_TOKEN = 'PASSWORD_STORAGE_SERVICE_TOKEN';

/**
 * Authentication config factory type.
 */
export type AuthenticationConfigFactory =
  ConfigFactory<AuthenticationConfigOptionsInterface> & ConfigFactoryKeyHost;

/**
 * Configuration for Authentication.
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
export const authenticationConfig: AuthenticationConfigFactory = registerAs(
  AUTHENTICATION_MODULE_CONFIG_TOKEN,
  (): AuthenticationConfigOptionsInterface => ({
    /**
     * Get log levels from environment variables
     */
    maxPasswordAttempts: process.env.AUTHENTICATION_MAX_PASSWORD_ATTEMPTS
      ? Number.parseInt(process.env.AUTHENTICATION_MAX_PASSWORD_ATTEMPTS)
      : 3,

    minPasswordStrength: process.env.AUTHENTICATION_MIN_PASSWORD_STRENGTH
      ? Number.parseInt(process.env.AUTHENTICATION_MIN_PASSWORD_STRENGTH)
      : 8,
  }),
);
