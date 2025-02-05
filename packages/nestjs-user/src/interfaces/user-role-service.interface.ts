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
  ): Promise<string[]>;

  /**
   * Normalize role names by filtering out invalid roles and removing duplicates.
   *
   * @param userRoles - Array of user role objects that may contain role names
   * @returns Array of unique, valid role names
   */
  normalizeRoleNames(
    userRoles: Partial<Pick<RoleOwnableInterface, 'role'>>[],
  ): string[];

  /**
   * Get password strength based on user roles.
   * Uses the configured passwordStrengthTransform callback if available.
   *
   * @param roles - Array of role names to check against
   * @returns Password strength enum value if callback exists and roles are provided,
   * undefined otherwise
   */
  resolvePasswordStrength(
    roles?: string[],
  ): PasswordStrengthEnum | null | undefined;
}
