import { OptionsInterface } from '@concepta/nestjs-common';
import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * JWT module settings interface
 */
export interface JwtSettingsInterface extends OptionsInterface {
  access?: Omit<JwtModuleOptions, 'secretOrPrivateKey'>;
  refresh?: Omit<JwtModuleOptions, 'secretOrPrivateKey'>;
}
