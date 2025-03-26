import { CanActivate } from '@nestjs/common';

import { AuthJwtSettingsInterface } from './auth-jwt-settings.interface';
import { AuthJwtUserLookupServiceInterface } from './auth-jwt-user-lookup-service.interface';
import { VerifyTokenServiceInterface } from '../../core/interfaces/verify-token-service.interface';

export interface AuthJwtOptionsInterface {
  settings?: AuthJwtSettingsInterface;
  userLookupService: AuthJwtUserLookupServiceInterface;
  verifyTokenService?: VerifyTokenServiceInterface;
  appGuard?: CanActivate | false;
}
