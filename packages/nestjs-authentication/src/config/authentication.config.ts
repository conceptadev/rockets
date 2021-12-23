import {
  ConfigFactory,
  ConfigFactoryKeyHost,
  registerAs,
} from '@nestjs/config';
import { AuthenticationOptionsInterface } from '../interfaces/authentication-options.interface';

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
  ConfigFactory<AuthenticationOptionsInterface> & ConfigFactoryKeyHost;

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
  (): AuthenticationOptionsInterface => ({}),
);
