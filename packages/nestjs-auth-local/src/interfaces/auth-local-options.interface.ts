import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import { PasswordStorageServiceInterface } from '@concepta/nestjs-password';
import { AuthLocalSettingsInterface } from './auth-local-settings.interface';
import { AuthLocalUserLookupServiceInterface } from './auth-local-user-lookup-service.interface';
import { AuthLocalValidateUserServiceInterface } from './auth-local-validate-user-service.interface';

export interface AuthLocalOptionsInterface {
  /**
   * Implementation of a class to lookup users
   */
  userLookupService: AuthLocalUserLookupServiceInterface;

  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  /**
   * Implementation of a class to validate user
   */
  validateUserService?: AuthLocalValidateUserServiceInterface;

  /**
   * Implementation of a class to handle password storage
   */
  passwordStorageService?: PasswordStorageServiceInterface;

  /**
   * Settings
   */
  settings?: AuthLocalSettingsInterface;
}
