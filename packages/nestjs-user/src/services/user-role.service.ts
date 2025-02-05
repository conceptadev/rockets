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
  ): Promise<string[]> {
    // get roles based on user id
    if (userToUpdateId) {
      const user: (ReferenceIdInterface<string> & UserRolesInterface) | null =
        await this.userLookupService.byId(userToUpdateId);
      if (user && user.userRoles)
        return this.normalizeRoleNames(user.userRoles);
    }

    // get roles from payload
    // TODO: review this, maybe do a logic to get by role Id as well ?
    if (
      userDto.userRoles &&
      userDto.userRoles?.some((userRole) => userRole.role?.name)
    ) {
      return this.normalizeRoleNames(userDto.userRoles);
    }

    return [];
  }

  normalizeRoleNames(userRoles: Partial<Pick<RoleOwnableInterface, 'role'>>[]) {
    return Array.from(
      new Set(
        userRoles
          .filter((userRole) => userRole.role?.name)
          .map((userRole) => userRole.role?.name ?? ''),
      ),
    );
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
    roles?: string[],
  ): PasswordStrengthEnum | null | undefined {
    return (
      roles &&
      this.userSettings.passwordStrength?.passwordStrengthTransform &&
      this.userSettings.passwordStrength?.passwordStrengthTransform({ roles })
    );
  }
}
