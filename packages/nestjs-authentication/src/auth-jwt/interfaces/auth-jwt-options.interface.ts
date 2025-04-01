import { CanActivate } from '@nestjs/common';

import { AuthJwtSettingsInterface } from './auth-jwt-settings.interface';
import { VerifyTokenServiceInterface } from '../../core/interfaces/verify-token-service.interface';
import { AuthUserLookupServiceInterface } from '../../core/interfaces/auth-user-lookup-service.interface';

export interface AuthJwtOptionsInterface {
  settings?: AuthJwtSettingsInterface;
  userLookupService: AuthUserLookupServiceInterface;
  verifyTokenService?: VerifyTokenServiceInterface;
  appGuard?: CanActivate | false;
}
