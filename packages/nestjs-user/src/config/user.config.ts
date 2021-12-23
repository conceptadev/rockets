import { UserOptionsInterface } from '../interfaces/user-options.interface';
import { registerAs } from '@nestjs/config';

/**
 * The token to which all User module options are set.
 */
export const USER_MODULE_OPTIONS_TOKEN = 'USER_MODULE_OPTIONS';

/**
 * Configuration for User.
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
export const userOptions = registerAs(
  USER_MODULE_OPTIONS_TOKEN,
  (): UserOptionsInterface => ({}),
);
