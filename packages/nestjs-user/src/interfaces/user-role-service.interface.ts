import { ReferenceId, RoleOwnableInterface } from '@concepta/nestjs-common';
import { PasswordStrengthEnum } from '@concepta/nestjs-password';

export interface UserRoleServiceInterface {
  /**
   * Get user roles from either the user DTO or by looking up the user.
   *
   * @param userId - Optional ID of user to lookup roles for
   * @returns Array of role names, or empty array if no roles found
   */
  getUserRoles(userId?: ReferenceId): Promise<RoleOwnableInterface[]>;

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
  ): PasswordStrengthEnum | undefined;

  /**
   * Get the password strength based on user roles
   *
   * @param userRoles - Optional array of roles from the user object
   * @param userToUpdateId - Optional ID of user being updated
   * @returns The resolved password strength enum value, or undefined if no roles found
   */
  getPasswordStrength(
    userRoles?: RoleOwnableInterface[],
    userToUpdateId?: ReferenceId,
  ): Promise<PasswordStrengthEnum | undefined>;
}
