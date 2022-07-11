import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * JWT module settings interface
 */
export interface JwtSettingsInterface {
  access?: Omit<JwtModuleOptions, 'secretOrPrivateKey'>;
  refresh?: Omit<JwtModuleOptions, 'secretOrPrivateKey'>;
}
