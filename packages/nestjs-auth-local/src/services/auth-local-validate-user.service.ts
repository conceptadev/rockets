import { Inject, Injectable } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { ValidateUserService } from '@concepta/nestjs-authentication';
import { PasswordValidationServiceInterface } from '@concepta/nestjs-password';
import {
  AuthLocalPasswordValidationService,
  AuthLocalUserLookupService,
} from '../auth-local.constants';
import { AuthLocalValidateUserInterface } from '../interfaces/auth-local-validate-user.interface';
import { AuthLocalValidateUserServiceInterface } from '../interfaces/auth-local-validate-user-service.interface';
import { AuthLocalUserLookupServiceInterface } from '../interfaces/auth-local-user-lookup-service.interface';
import { AuthLocalUsernameNotFoundException } from '../exceptions/auth-local-username-not-found.exception';
import { AuthLocalUserInactiveException } from '../exceptions/auth-local-user-inactive.exception';
import { AuthLocalInvalidPasswordException } from '../exceptions/auth-local-invalid-password.exception';

@Injectable()
export class AuthLocalValidateUserService
  extends ValidateUserService<[AuthLocalValidateUserInterface]>
  implements AuthLocalValidateUserServiceInterface
{
  constructor(
    @Inject(AuthLocalUserLookupService)
    protected readonly userLookupService: AuthLocalUserLookupServiceInterface,
    @Inject(AuthLocalPasswordValidationService)
    protected readonly passwordValidationService: PasswordValidationServiceInterface,
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
      throw new AuthLocalInvalidPasswordException(user.username);
    }

    // return the user
    return user;
  }
}
