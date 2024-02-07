import { Inject, Injectable } from '@nestjs/common';
import { ReferenceId, ReferenceIdInterface } from '@concepta/ts-core';
import {
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
    private userLookupService: UserLookupServiceInterface,
    @Inject(PasswordCreationService)
    private passwordCreationService: PasswordCreationServiceInterface,
  ) {}

  async setPassword(
    passwordDto: Partial<
      PasswordPlainInterface & PasswordPlainCurrentInterface
    >,
    userId?: ReferenceId,
  ): ReturnType<PasswordCreationService['createObject']> {
    // are we updating?
    if (userId) {
      // yes, get the user
      const userToUpdate = await this.getUserById(userId);

      // is the user updating their own password?
      if (userToUpdate.id === userId) {
        // call current password validation helper
        await this.validateCurrent(userToUpdate, passwordDto?.passwordCurrent);
      }
    }

    // break out the password
    const { password } = passwordDto ?? {};

    // is current valid (this will be true if not required)
    if (typeof password === 'string') {
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

  async canUpdate(
    userToUpdate: ReferenceIdInterface,
    authenticatedUser: ReferenceIdInterface,
  ): Promise<boolean> {
    // by default, only authenticated user can update their own password
    return userToUpdate.id === authenticatedUser.id;
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

      // type guards
      if (
        typeof passwordHash === 'string' &&
        typeof passwordSalt === 'string'
      ) {
        // return the user with asserted storage types
        return { ...user, passwordHash, passwordSalt };
      } else {
        throw new UserException(
          'User object is missing some or all password storage properties',
        );
      }
    }

    // throw an exception by default
    throw new UserNotFoundException(
      'Impossible to update password if user is not found',
    );
  }

  protected async validateCurrent(
    target: PasswordStorageInterface,
    password?: string,
  ): Promise<boolean> {
    // call current password validation helper
    const currentIsValid = await this.passwordCreationService.validateCurrent({
      password,
      target,
    });

    if (currentIsValid) {
      return true;
    } else {
      throw new UserException(`Current password is not valid`);
    }
  }
}
