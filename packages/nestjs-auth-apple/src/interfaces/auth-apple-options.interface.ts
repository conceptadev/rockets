import { ModuleOptionsSettingsInterface } from '@concepta/nestjs-core';
import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import { JwtVerifyServiceInterface } from '@concepta/nestjs-jwt';
import { AuthAppleSettingsInterface } from './auth-apple-settings.interface';
import { AuthAppleServiceInterface } from './auth-apple-service.interface';

export interface AuthAppleOptionsInterface
  extends ModuleOptionsSettingsInterface<AuthAppleSettingsInterface> {
  /**
   * Implementation of a class used to verify Apple tokens
   */
  jwtService?: JwtVerifyServiceInterface;

  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  /**
   * Implementation of a class to handle apple authentication
   */
  authAppleService?: AuthAppleServiceInterface;

  /**
   * Settings
   */
  settings?: AuthAppleSettingsInterface;
}
