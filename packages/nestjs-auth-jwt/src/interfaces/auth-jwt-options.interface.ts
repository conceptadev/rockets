import { VerifyTokenServiceInterface } from '@concepta/nestjs-authentication';
import { OptionsInterface } from '@concepta/nestjs-common';
import { AuthJwtSettingsInterface } from './auth-jwt-settings.interface';
import { AuthJwtUserLookupServiceInterface } from './auth-jwt-user-lookup-service.interface';

export interface AuthJwtOptionsInterface extends OptionsInterface {
  settings?: AuthJwtSettingsInterface;
  userLookupService: AuthJwtUserLookupServiceInterface;
  verifyTokenService?: VerifyTokenServiceInterface;
}
