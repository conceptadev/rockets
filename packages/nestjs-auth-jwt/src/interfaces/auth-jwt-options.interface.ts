import { VerifyTokenServiceInterface } from '@rockts-org/nestjs-authentication';
import { OptionsInterface } from '@rockts-org/nestjs-common';
import { AuthJwtSettingsInterface } from './auth-jwt-settings.interface';
import { AuthJwtUserLookupServiceInterface } from './auth-jwt-user-lookup.interface';

export interface AuthJwtOptionsInterface extends OptionsInterface {
  settings?: AuthJwtSettingsInterface;
  verifyTokenService?: VerifyTokenServiceInterface;
  userLookupService?: AuthJwtUserLookupServiceInterface;
}
