import { registerAs } from '@nestjs/config';
import { JwtOptionsInterface } from '../interfaces/jwt-options.interface';

/**
 * The token to which all JWT module options are set.
 */
export const JWT_MODULE_CONFIG_TOKEN = 'JWT_MODULE_CONFIG';

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
export const jwtConfig = registerAs(
  JWT_MODULE_CONFIG_TOKEN,
  (): JwtOptionsInterface => ({
    secret: 'THERE IS NO SECRET',
  }),
);
