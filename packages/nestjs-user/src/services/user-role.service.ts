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

@Injectable()
export class UserRoleService implements UserRoleServiceInterface {
  constructor(
    @Inject(USER_MODULE_SETTINGS_TOKEN)
    protected readonly userSettings: UserSettingsInterface,
    @Inject(UserLookupService)
    protected readonly userLookupService: UserLookupServiceInterface,
  ) {}

  async getUserRoles(
    userDto: UserRolesInterface,
    userToUpdateId?: ReferenceId,
  ): Promise<RoleOwnableInterface[]> {
    // get roles based on user id
    if (userToUpdateId) {
      const user: (ReferenceIdInterface<string> & UserRolesInterface) | null =
        await this.userLookupService.byId(userToUpdateId);
      if (user && user.userRoles) return user.userRoles;
    }

    // get roles from payload
    if (userDto.userRoles && userDto.userRoles.length > 0)
      return userDto.userRoles;

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
  ): PasswordStrengthEnum | null | undefined {
    return (
      roles &&
      this.userSettings.passwordStrength?.passwordStrengthTransform &&
      this.userSettings.passwordStrength?.passwordStrengthTransform({ roles })
    );
  }
}
