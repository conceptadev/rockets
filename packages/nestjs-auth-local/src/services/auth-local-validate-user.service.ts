import { Inject, Injectable } from '@nestjs/common';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { ValidateUserService } from '@concepta/nestjs-authentication';
import { PasswordValidationServiceInterface } from '@concepta/nestjs-password';
import {
  AUTH_LOCAL_MODULE_PASSWORD_VALIDATION_SERVICE_TOKEN,
  AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN,
} from '../auth-local.constants';
import { AuthLocalValidateUserInterface } from '../interfaces/auth-local-validate-user.interface';
import { AuthLocalValidateUserServiceInterface } from '../interfaces/auth-local-validate-user-service.interface';
import { AuthLocalUserLookupServiceInterface } from '../interfaces/auth-local-user-lookup-service.interface';

@Injectable()
export class AuthLocalValidateUserService
  extends ValidateUserService<[AuthLocalValidateUserInterface]>
  implements AuthLocalValidateUserServiceInterface
{
  constructor(
    @Inject(AUTH_LOCAL_MODULE_USER_LOOKUP_SERVICE_TOKEN)
    private userLookupService: AuthLocalUserLookupServiceInterface,
    @Inject(AUTH_LOCAL_MODULE_PASSWORD_VALIDATION_SERVICE_TOKEN)
    private passwordValidationService: PasswordValidationServiceInterface,
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
      throw new Error(`No user found for username: ${dto.username}`);
    }

    const isUserActive = await this.isActive(user);

    // is the user active?
    if (!isUserActive) {
      throw new Error(`User with username '${dto.username}' is inactive`);
    }

    // validate password
    const isValid = await this.passwordValidationService.validateObject(
      dto.password,
      user,
    );

    // password is valid?
    if (!isValid) {
      throw new Error(`Invalid password for username: ${user.username}`);
    }

    // return the user
    return user;
  }
}
