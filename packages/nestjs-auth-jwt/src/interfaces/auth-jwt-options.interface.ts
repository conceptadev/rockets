import { VerifyTokenServiceInterface } from '@concepta/nestjs-authentication';
import { AuthJwtSettingsInterface } from './auth-jwt-settings.interface';
import { AuthJwtUserLookupServiceInterface } from './auth-jwt-user-lookup-service.interface';

export interface AuthJwtOptionsInterface {
  settings?: AuthJwtSettingsInterface;
  userLookupService: AuthJwtUserLookupServiceInterface;
  verifyTokenService?: VerifyTokenServiceInterface;
}
