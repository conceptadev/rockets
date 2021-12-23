import { PasswordOptionsInterface } from '../interfaces/password-options.interface';
import { registerAs } from '@nestjs/config';

/**
 * The token to which all Password module options are set.
 */
export const PASSWORD_MODULE_OPTIONS_TOKEN = 'PASSWORD_MODULE_OPTIONS';

export const PASSWORD_STORAGE_SERVICE_TOKEN = 'PASSWORD_STORAGE_SERVICE';

/**
 * Configuration for Password.
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
export const passwordOptions = registerAs(
  PASSWORD_MODULE_OPTIONS_TOKEN,
  (): PasswordOptionsInterface => ({
    /**
     * Get log levels from environment variables
     */
    maxPasswordAttempts: process.env.PASSWORD_MAX_PASSWORD_ATTEMPTS
      ? Number.parseInt(process.env.PASSWORD_MAX_PASSWORD_ATTEMPTS)
      : 3,

    minPasswordStrength: process.env.PASSWORD_MIN_PASSWORD_STRENGTH
      ? Number.parseInt(process.env.PASSWORD_MIN_PASSWORD_STRENGTH)
      : 8,
  }),
);
