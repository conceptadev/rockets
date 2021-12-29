import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * Configuration for default service.
 */
export const defaultServiceConfig = registerAs(
  'JWT_MODULE_DEFAULT_SERVICE_CONFIG',
  (): JwtModuleOptions => ({
    secretOrPrivateKey: 'THERE IS NO SECRET',
  }),
);
