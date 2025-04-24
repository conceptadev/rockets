import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import { PasswordValidationServiceInterface } from '@concepta/nestjs-password';
import { AuthLocalSettingsInterface } from './auth-local-settings.interface';
import { AuthLocalUserModelServiceInterface } from './auth-local-user-model-service.interface';
import { AuthLocalValidateUserServiceInterface } from './auth-local-validate-user-service.interface';

export interface AuthLocalOptionsInterface {
  /**
   * Implementation of user model service class
   */
  userModelService: AuthLocalUserModelServiceInterface;

  /**
   * Implementation of a class to issue tokens
   */
  issueTokenService?: IssueTokenServiceInterface;

  /**
   * Implementation of a class to validate user
   */
  validateUserService?: AuthLocalValidateUserServiceInterface;

  /**
   * Implementation of a class to handle password validation
   */
  passwordValidationService?: PasswordValidationServiceInterface;

  /**
   * Settings
   */
  settings?: AuthLocalSettingsInterface;
}
