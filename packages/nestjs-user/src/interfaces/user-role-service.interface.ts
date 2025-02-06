import {
  ReferenceId,
  RoleOwnableInterface,
  UserRolesInterface,
} from '@concepta/nestjs-common';
import { PasswordStrengthEnum } from '@concepta/nestjs-password';

export interface UserRoleServiceInterface {
  /**
   * Get user roles from either the user DTO or by looking up the user.
   *
   * @param userDto - User DTO that may contain user roles
   * @param userToUpdateId - Optional ID of user to lookup roles for
   * @returns Array of role names, or empty array if no roles found
   */
  getUserRoles(
    userDto: UserRolesInterface,
    userToUpdateId?: ReferenceId,
  ): Promise<RoleOwnableInterface[]>;

  /**
   * Get password strength based on user roles.
   * Uses the configured passwordStrengthTransform callback if available.
   *
   * @param roles - Array of roles to check against
   * @returns Password strength enum value if callback exists and roles are provided,
   * undefined otherwise
   */
  resolvePasswordStrength(
    roles?: RoleOwnableInterface[],
  ): PasswordStrengthEnum | null | undefined;
}
