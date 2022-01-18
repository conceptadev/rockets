import { UserOptionsInterface } from '../interfaces/user-options.interface';
import { registerAs } from '@nestjs/config';
import { USER_MODULE_DEFAULT_SETTINGS_TOKEN } from '../user.constants';

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
export const userDefaultConfig = registerAs(
  USER_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): UserOptionsInterface => ({}),
);
