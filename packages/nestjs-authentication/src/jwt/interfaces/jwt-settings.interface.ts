import { NestJwtModuleOptions } from '../jwt.externals';

/**
 * JWT module settings interface
 */
export interface JwtSettingsInterface {
  default?: Omit<NestJwtModuleOptions, 'secretOrPrivateKey'>;
  access?: Omit<NestJwtModuleOptions, 'secretOrPrivateKey'>;
  refresh?: Omit<NestJwtModuleOptions, 'secretOrPrivateKey'>;
}
