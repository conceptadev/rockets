import { JwtModuleOptions } from '@nestjs/jwt';
import { OptionsInterface } from '@rockts-org/nestjs-common';

/**
 * JWT module configuration options interface
 */
export interface JwtOptionsInterface
  extends OptionsInterface,
    JwtModuleOptions {}
