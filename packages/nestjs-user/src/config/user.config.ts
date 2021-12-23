import { registerAs } from '@nestjs/config';
import { UserOptionsInterface } from '../interfaces/user-options.interface';

/**
 * The token to which all User module options are set.
 */
export const USER_MODULE_CONFIG_TOKEN = 'USER_MODULE_CONFIG';

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
export const userConfig = registerAs(
  USER_MODULE_CONFIG_TOKEN,
  (): UserOptionsInterface => ({}),
);
