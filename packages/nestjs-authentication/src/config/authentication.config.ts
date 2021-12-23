import { AuthenticationOptionsInterface } from '../interfaces/authentication-options.interface';
import { registerAs } from '@nestjs/config';

/**
 * The token to which all Authentication module options are set.
 */
export const AUTHENTICATION_MODULE_OPTIONS_TOKEN =
  'AUTHENTICATION_MODULE_OPTIONS';

export const CREDENTIAL_LOOKUP_SERVICE_TOKEN = 'CREDENTIAL_LOOKUP_SERVICE';
export const PASSWORD_STORAGE_SERVICE_TOKEN = 'PASSWORD_STORAGE_SERVICE';

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
export const authenticationOptions = registerAs(
  AUTHENTICATION_MODULE_OPTIONS_TOKEN,
  (): AuthenticationOptionsInterface => ({}),
);
