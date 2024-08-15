import { NestJwtModuleOptions } from '../jwt.externals';

/**
 * JWT module settings interface
 */
export interface JwtSettingsInterface {
  access?: Omit<NestJwtModuleOptions, 'secretOrPrivateKey'>;
  refresh?: Omit<NestJwtModuleOptions, 'secretOrPrivateKey'>;
}
