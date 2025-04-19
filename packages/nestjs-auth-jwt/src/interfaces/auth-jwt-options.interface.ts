import { CanActivate } from '@nestjs/common';
import { VerifyTokenServiceInterface } from '@concepta/nestjs-authentication';
import { AuthJwtSettingsInterface } from './auth-jwt-settings.interface';
import { AuthJwtUserModelServiceInterface } from './auth-jwt-user-model-service.interface';

export interface AuthJwtOptionsInterface {
  settings?: AuthJwtSettingsInterface;
  userModelService: AuthJwtUserModelServiceInterface;
  verifyTokenService?: VerifyTokenServiceInterface;
  appGuard?: CanActivate | false;
}
