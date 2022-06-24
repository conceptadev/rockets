import { ReferenceIdInterface } from '@concepta/ts-core';
import { RoleAssigneeInterface } from './role-assignee.interface';
import { RoleEntityInterface } from './role-entity.interface';
import { RoleInterface } from './role.interface';

export interface RoleServiceInterface {
  /**
   * Get all roles for assignee.
   *
   * @param assignment The assignment of the check (same as entity key)
   * @param assignee The assignee to check
   */
  getAssignedRoles(
    assignment: string,
    assignee: Partial<RoleAssigneeInterface>,
  ): Promise<RoleEntityInterface[]>;

  /**
   * Check if the assignee is a member of one role.
   *
   * @param assignment The assignment of the check
   * @param role The role to check
   * @param assignee The assignee to check
   */
  isAssignedRole<T extends RoleAssigneeInterface>(
    assignment: string,
    role: Partial<RoleInterface>,
    assignee: Partial<T>,
  ): Promise<boolean>;

  /**
   * Check if the assignee is a member of every role.
   *
   * @param assignment The assignment of the check
   * @param roles The roles to check
   * @param assignee The assignee to check
   */
  isAssignedRoles<T extends RoleAssigneeInterface>(
    assignment: string,
    roles: ReferenceIdInterface[],
    assignee: Partial<T>,
  ): Promise<boolean>;
}
