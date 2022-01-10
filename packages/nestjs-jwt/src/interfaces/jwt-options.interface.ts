import { OptionsInterface } from '@rockts-org/nestjs-common';
import { JwtServiceInterface } from './jwt-service.interface';

/**
 * JWT module configuration options interface
 */
export interface JwtOptionsInterface extends OptionsInterface {
  jwtService?: JwtServiceInterface;
}
