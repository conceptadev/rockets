import { HttpStatus, Inject, Injectable, Optional } from '@nestjs/common';
import {
  ReferenceId,
  ReferenceIdInterface,
  RoleOwnableInterface,
  UserRolesInterface,
} from '@concepta/nestjs-common';
import {
  AuthenticatedUserInterface,
  PasswordPlainCurrentInterface,
  PasswordPlainInterface,
} from '@concepta/nestjs-common';
import {
  isPasswordStorage,
  PasswordCreationService,
  PasswordCreationServiceInterface,
  PasswordStorageInterface,
  PasswordStrengthEnum,
} from '@concepta/nestjs-password';

import { UserPasswordServiceInterface } from '../interfaces/user-password-service.interface';
import { UserLookupServiceInterface } from '../interfaces/user-lookup-service.interface';
import { UserPasswordHistoryServiceInterface } from '../interfaces/user-password-history-service.interface';
import { UserLookupService } from './user-lookup.service';
import { UserPasswordHistoryService } from './user-password-history.service';
import { UserException } from '../exceptions/user-exception';
import { UserNotFoundException } from '../exceptions/user-not-found-exception';
import { USER_MODULE_SETTINGS_TOKEN } from '../user.constants';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';

/**
 * User password service
 */
@Injectable()
export class UserPasswordService implements UserPasswordServiceInterface {
  /**
   * Constructor
   *
   * @param userLookupService - user lookup service
   * @param passwordCreationService - password creation service
   */
  constructor(
    @Inject(UserLookupService)
    protected readonly userLookupService: UserLookupServiceInterface,
    @Inject(PasswordCreationService)
    protected readonly passwordCreationService: PasswordCreationServiceInterface,
    @Inject(USER_MODULE_SETTINGS_TOKEN)
    protected readonly userSettings: UserSettingsInterface,
    @Optional()
    @Inject(UserPasswordHistoryService)
    private userPasswordHistoryService?: UserPasswordHistoryServiceInterface,
  ) {}

  async setPassword(
    passwordDto: Partial<
      PasswordPlainInterface &
        PasswordPlainCurrentInterface &
        UserRolesInterface
    >,
    userToUpdateId?: ReferenceId,
    authorizedUser?: AuthenticatedUserInterface,
  ): ReturnType<PasswordCreationService['createObject']> {
    // break out the password
    const { password } = passwordDto ?? {};

    // user to update
    let userToUpdate:
      | (ReferenceIdInterface & PasswordStorageInterface)
      | undefined = undefined;

    // did we receive a password to set?
    if (typeof password === 'string') {
      // are we updating?
      if (userToUpdateId) {
        // yes, get the user
        userToUpdate = await this.getPasswordStore(userToUpdateId);

        // call current password validation helper
        await this.validateCurrent(
          userToUpdate,
          passwordDto?.passwordCurrent,
          authorizedUser,
        );

        // call password history validation helper
        await this.validateHistory(userToUpdate, password);
      }

      // create safe object
      const targetSafe = { ...passwordDto, password };

      const roles = await this.getUserRoles(passwordDto, userToUpdateId);
      const passwordStrength = await this.getPasswordStrength(roles);

      const userWithPasswordHashed =
        await this.passwordCreationService.createObject(targetSafe, {
          required: false,
          passwordStrength,
        });

      // push password history if necessary
      if (
        this.userPasswordHistoryService &&
        userToUpdate &&
        isPasswordStorage(userWithPasswordHashed)
      ) {
        await this.userPasswordHistoryService.pushHistory(
          userToUpdate.id,
          userWithPasswordHashed,
        );
      }

      // return user
      return userWithPasswordHashed;
    }

    // return the object untouched
    return passwordDto;
  }
  // TODO: add function to call the callback and this can ber overwrite

  /**
   * Get user roles from either the password DTO or by looking up the user.
   *
   * @param passwordDto - Password DTO that may contain user roles
   * @param userToUpdateId - Optional ID of user to lookup roles for
   * @returns Array of role names, or empty array if no roles found
   */
  protected async getUserRoles(
    passwordDto: Partial<UserRolesInterface>,
    userToUpdateId?: ReferenceId,
  ): Promise<string[]> {
    // get roles based on user id
    if (userToUpdateId) {
      const user:
        | (ReferenceIdInterface<string> & Partial<UserRolesInterface>)
        | null = await this.userLookupService.byId(userToUpdateId);
      if (user && user.userRoles) return this.mapRoles(user.userRoles);
    }

    // get roles from payload
    if (
      passwordDto.userRoles &&
      passwordDto.userRoles?.some((userRole) => userRole.role?.name)
    ) {
      return this.mapRoles(passwordDto.userRoles);
    }

    return [];
  }

  mapRoles(userRoles: Partial<Pick<RoleOwnableInterface, 'role'>>[]) {
    return [
      ...new Set(
        userRoles
          .filter((userRole) => userRole.role?.name)
          .map((userRole) => userRole.role?.name ?? ''),
      ),
    ];
  }
  /**
   * Get password strength based on user roles. if callback is not enough
   * user can always be able to overwrite this method to take advantage of injections
   *
   * @param roles - Array of role names to check against
   * @returns Password strength enum value if callback exists and roles are provided,
   * undefined otherwise
   */
  protected getPasswordStrength(
    roles?: string[],
  ): PasswordStrengthEnum | null | undefined {
    return (
      roles &&
      this.userSettings.passwordStrength?.passwordStrengthCallback &&
      this.userSettings.passwordStrength?.passwordStrengthCallback(roles || [])
    );
  }
  async getPasswordStore(
    userId: ReferenceId,
  ): Promise<ReferenceIdInterface & PasswordStorageInterface> {
    let user: (ReferenceIdInterface & Partial<PasswordStorageInterface>) | null;

    try {
      // try to lookup the user
      user = await this.userLookupService.byId(userId);
    } catch (e: unknown) {
      throw new UserException({
        message: 'Cannot update password, error while getting user by id',
        originalError: e,
      });
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
    throw new UserNotFoundException({
      message: 'Impossible to update password if user is not found',
    });
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
        throw new UserException({
          message: `Current password is not valid`,
          httpStatus: HttpStatus.BAD_REQUEST,
        });
      }
    }

    // return true by default
    return true;
  }

  protected async validateHistory(
    user: ReferenceIdInterface,
    password?: string,
  ): Promise<boolean> {
    // was a history service injected?
    if (this.userPasswordHistoryService) {
      // get password history for user
      const passwordHistory = await this.userPasswordHistoryService.getHistory(
        user.id,
      );

      // call password history validation helper
      const isValid = await this.passwordCreationService.validateHistory({
        password,
        targets: passwordHistory,
      });

      if (!isValid) {
        throw new UserException({
          message: `Password has been used too recently.`,
          httpStatus: HttpStatus.BAD_REQUEST,
        });
      }
    }

    // return true by default
    return true;
  }
}
