import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * Configuration for default signing service.
 */
export const defaultSignServiceConfig = registerAs(
  'JWT_MODULE_DEFAULT_SERVICE_CONFIG',
  (): JwtModuleOptions => ({
    secretOrPrivateKey: 'THERE IS NO SECRET',
  }),
);
