import { JwtOptionsInterface } from '../interfaces/jwt-options.interface';
import { registerAs } from '@nestjs/config';

/**
 * The token to which all JWT module options are set.
 */
export const JWT_MODULE_OPTIONS_TOKEN = 'JWT_MODULE_OPTIONS';

/**
 * Configuration for JWT.
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
export const jwtOptions = registerAs(
  JWT_MODULE_OPTIONS_TOKEN,
  (): JwtOptionsInterface => ({
    secretOrPrivateKey: 'THERE IS NO SECRET',
  }),
);
