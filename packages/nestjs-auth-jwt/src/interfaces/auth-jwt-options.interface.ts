import { OptionsInterface } from '@rockts-org/nestjs-common';
import { AuthJwtSettingsInterface } from './auth-jwt-settings.interface';

export interface AuthJwtOptionsInterface extends OptionsInterface {
  settings?: AuthJwtSettingsInterface;
}
