import { Inject, Injectable } from '@nestjs/common';
import { ReferenceId, ReferenceIdInterface } from '@concepta/ts-core';
import {
  AuthenticatedUserInterface,
  PasswordPlainCurrentInterface,
  PasswordPlainInterface,
} from '@concepta/ts-common';
import {
  PasswordCreationService,
  PasswordCreationServiceInterface,
  PasswordStorageInterface,
} from '@concepta/nestjs-password';

import { UserPasswordServiceInterface } from '../interfaces/user-password-service.interface';
import { UserLookupServiceInterface } from '../interfaces/user-lookup-service.interface';
import { UserLookupService } from './user-lookup.service';
import { UserException } from '../exceptions/user-exception';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';

/**
 * User password service
 */
@Injectable()
export class UserPasswordService implements UserPasswordServiceInterface {
  /**
   * Constructor
   *
   * @param userLookupService user lookup service
   * @param passwordCreationService password creation service
   */
  constructor(
    @Inject(UserLookupService)
    protected readonly userLookupService: UserLookupServiceInterface,
    @Inject(PasswordCreationService)
    protected readonly passwordCreationService: PasswordCreationServiceInterface,
  ) {}

  async setPassword(
    passwordDto: Partial<
      PasswordPlainInterface & PasswordPlainCurrentInterface
    >,
    userToUpdateId?: ReferenceId,
    authorizedUser?: AuthenticatedUserInterface,
  ): ReturnType<PasswordCreationService['createObject']> {
    // break out the password
    const { password } = passwordDto ?? {};

    // did we receive a password to set?
    if (typeof password === 'string') {
      // are we updating?
      if (userToUpdateId) {
        // yes, get the user
        const userToUpdate = await this.getUserById(userToUpdateId);
        // call current password validation helper
        await this.validateCurrent(
          userToUpdate,
          passwordDto?.passwordCurrent,
          authorizedUser,
        );
      }
      // create safe object
      const targetSafe = { ...passwordDto, password };
      // call the password creation service
      return await this.passwordCreationService.createObject(targetSafe, {
        required: false,
      });
    }

    // return the object untouched
    return passwordDto;
  }

  async getUserById(
    userId: ReferenceId,
  ): Promise<ReferenceIdInterface & PasswordStorageInterface> {
    let user: (ReferenceIdInterface & Partial<PasswordStorageInterface>) | null;

    try {
      // try to lookup the user
      user = await this.userLookupService.byId(userId);
    } catch (e: unknown) {
      throw new UserException(
        'Cannot update password, error while getting user by id',
        e,
      );
    }

    // did we get a user?
    if (user) {
      // break out the stored password
      const { passwordHash, passwordSalt } = user;

      // return the user with asserted storage types
      return {
        ...user,
        passwordHash: typeof passwordHash === 'string' ? passwordHash : '',
        passwordSalt: typeof passwordSalt === 'string' ? passwordSalt : '',
      };
    }

    // throw an exception by default
    throw new UserNotFoundException(
      'Impossible to update password if user is not found',
    );
  }

  protected async validateCurrent(
    target: ReferenceIdInterface & PasswordStorageInterface,
    password?: string,
    authorizedUser?: AuthenticatedUserInterface,
  ): Promise<boolean> {
    // is the user updating their own password?
    if (target.id === authorizedUser?.id) {
      // call current password validation helper
      const currentIsValid = await this.passwordCreationService.validateCurrent(
        {
          password,
          target,
        },
      );

      if (currentIsValid) {
        return true;
      } else {
        throw new UserException(`Current password is not valid`);
      }
    }

    return true;
  }
}
