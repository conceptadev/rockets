import { Inject, Injectable, Optional } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { ValidateUserService } from '@concepta/nestjs-authentication';
import { PasswordValidationServiceInterface } from '@concepta/nestjs-password';
import {
  AUTH_LOCAL_MODULE_PASSWORD_VALIDATION_SERVICE_TOKEN,
  AUTH_LOCAL_MODULE_SETTINGS_TOKEN,
  AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN,
} from '../auth-local.constants';
import { AuthLocalValidateUserInterface } from '../interfaces/auth-local-validate-user.interface';
import { AuthLocalValidateUserServiceInterface } from '../interfaces/auth-local-validate-user-service.interface';
import { AuthLocalUserLookupServiceInterface } from '../interfaces/auth-local-user-lookup-service.interface';
import { AuthLocalUsernameNotFoundException } from '../exceptions/auth-local-username-not-found.exception';
import { AuthLocalUserInactiveException } from '../exceptions/auth-local-user-inactive.exception';
import { AuthLocalInvalidPasswordException } from '../exceptions/auth-local-invalid-password.exception';
import { AuthLocalSettingsInterface } from '../interfaces/auth-local-settings.interface';
import { AuthLocalUserLockedException } from '../exceptions/auth-local-user-locked.exception';
import { AuthLocalUserAttemptsException } from '../exceptions/auth-local-user-attempts.exception';

@Injectable()
export class AuthLocalValidateUserService
  extends ValidateUserService<[AuthLocalValidateUserInterface]>
  implements AuthLocalValidateUserServiceInterface
{
  constructor(
    @Inject(AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    protected readonly userLookupService: AuthLocalUserLookupServiceInterface,
    @Inject(AUTH_LOCAL_MODULE_PASSWORD_VALIDATION_SERVICE_TOKEN)
    protected readonly passwordValidationService: PasswordValidationServiceInterface,
    @Optional()
    @Inject(AUTH_LOCAL_MODULE_SETTINGS_TOKEN)
    private settings?: AuthLocalSettingsInterface,
  ) {
    super();
  }

  /**
   * Returns true if user is considered valid for authentication purposes.
   */
  async validateUser(
    dto: AuthLocalValidateUserInterface,
  ): Promise<ReferenceIdInterface> {
    // try to get the user by username
    const user = await this.userLookupService.byUsername(dto.username);

    // did we get a user?
    if (!user) {
      throw new AuthLocalUsernameNotFoundException(dto.username);
    }

    if (this.settings && this.settings?.maxAttempts > 0) {
      const isLocked = await this.isLocked(user, this.settings.maxAttempts);
      if (isLocked) {
        throw new AuthLocalUserLockedException();
      }
    }

    const isUserActive = await this.isActive(user);

    // is the user active?
    if (!isUserActive) {
      throw new AuthLocalUserInactiveException(dto.username);
    }

    // validate password
    const isValid = await this.passwordValidationService.validateObject(
      dto.password,
      user,
    );

    // password is valid?
    if (!isValid) {
      const shouldDisplayAttemptsError =
        this.settings &&
        this.settings.maxAttempts > 0 &&
        this.settings.minAttempts > 0 &&
        user.loginAttempts &&
        user.loginAttempts >= this.settings.minAttempts;

      if (shouldDisplayAttemptsError) {
        const attemptsLeft =
          (this.settings?.maxAttempts ?? 0) - (user.loginAttempts ?? 0);
        throw new AuthLocalUserAttemptsException(attemptsLeft);
      } else throw new AuthLocalInvalidPasswordException(user.username);
    }

    // return the user
    return user;
  }
}
