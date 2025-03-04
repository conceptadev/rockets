import {
  ReferenceId,
  ReferenceIdInterface,
  RoleOwnableInterface,
  UserRolesInterface,
} from '@concepta/nestjs-common';
import { PasswordStrengthEnum } from '@concepta/nestjs-password';
import { Inject, Injectable } from '@nestjs/common';

import { UserLookupServiceInterface } from '../interfaces/user-lookup-service.interface';
import { UserSettingsInterface } from '../interfaces/user-settings.interface';
import { USER_MODULE_SETTINGS_TOKEN } from '../user.constants';
import { UserLookupService } from './user-lookup.service';
import { UserRoleServiceInterface } from '../interfaces/user-role-service.interface';
import { UserRolesException } from '../exceptions/user-roles-exception';
import { UserRolePasswordException } from '../exceptions/user-role-password-exception';

@Injectable()
export class UserRoleService implements UserRoleServiceInterface {
  constructor(
    @Inject(USER_MODULE_SETTINGS_TOKEN)
    protected readonly userSettings: UserSettingsInterface,
    @Inject(UserLookupService)
    protected readonly userLookupService: UserLookupServiceInterface,
  ) {}

  async getUserRoles(userId?: ReferenceId): Promise<RoleOwnableInterface[]> {
    if (userId) {
      try {
        const user: (ReferenceIdInterface<string> & UserRolesInterface) | null =
          await this.userLookupService.byId(userId);
        if (user && user.userRoles) {
          return user.userRoles;
        }
      } catch (err) {
        throw new UserRolesException(userId, {
          originalError: err,
        });
      }
    }

    return [];
  }

  /**
   * Get password strength based on user roles. if callback is not enough
   * user can always be able to overwrite this method to take advantage of injections
   *
   * @param roles - Array of role names to check against
   * @returns Password strength enum value if callback exists and roles are provided,
   * undefined otherwise
   */
  resolvePasswordStrength(
    roles?: RoleOwnableInterface[],
  ): PasswordStrengthEnum | undefined {
    if (roles) {
      try {
        return (
          this.userSettings.passwordStrength?.passwordStrengthTransform &&
          this.userSettings.passwordStrength?.passwordStrengthTransform({
            roles,
          })
        );
      } catch (err) {
        throw new UserRolePasswordException({
          originalError: err,
        });
      }
    }
  }

  /**
   * Get the password strength based on user roles
   *
   * @param userRoles - The user roles
   * @param userToUpdateId - Optional ID of user being updated
   * @returns The resolved password strength enum value, or null/undefined if no roles service
   */
  async getPasswordStrength(
    userRoles?: RoleOwnableInterface[],
    userToUpdateId?: ReferenceId,
  ): Promise<PasswordStrengthEnum | undefined> {
    let passwordStrength = undefined;

    const roles = userRoles ?? (await this.getUserRoles(userToUpdateId));
    passwordStrength = await this.resolvePasswordStrength(roles);

    return passwordStrength;
  }
}
