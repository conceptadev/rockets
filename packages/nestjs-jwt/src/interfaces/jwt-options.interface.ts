import { JwtModuleOptions } from '@nestjs/jwt';
import {
  OptionsAsyncInterface,
  OptionsInterface,
} from '@rockts-org/nestjs-common';

/**
 * JWT module configuration options interface
 */
export interface JwtOptionsInterface
  extends OptionsInterface,
    JwtModuleOptions {}

/**
 * JWT async module configuration options interface
 */
export interface JwtAsyncOptionsInterface
  extends JwtOptionsInterface,
    OptionsAsyncInterface<JwtOptionsInterface> {}
