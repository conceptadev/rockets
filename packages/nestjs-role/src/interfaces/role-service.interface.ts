import {
  ReferenceAssignment,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { RoleInterface } from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { RoleEntityInterface } from './role-entity.interface';
import { RoleAssignmentEntityInterface } from './role-assignment-entity.interface';

export interface RoleServiceInterface {
  /**
   * Get all roles for assignee.
   *
   * @param assignment - The assignment of the check (same as entity key)
   * @param assignee - The assignee to check
   */
  getAssignedRoles(
    assignment: ReferenceAssignment,
    assignee: ReferenceIdInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<RoleEntityInterface[]>;

  /**
   * Check if the assignee is a member of one role.
   *
   * @param assignment - The assignment of the check
   * @param role - The role to check
   * @param assignee - The assignee to check
   */
  isAssignedRole<T extends ReferenceIdInterface>(
    assignment: ReferenceAssignment,
    role: Partial<RoleInterface>,
    assignee: T,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean>;

  /**
   * Check if the assignee is a member of every role.
   *
   * @param assignment - The assignment of the check
   * @param roles - The roles to check
   * @param assignee - The assignee to check
   */
  isAssignedRoles<T extends ReferenceIdInterface>(
    assignment: ReferenceAssignment,
    roles: ReferenceIdInterface[],
    assignee: T,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean>;
  /**
   * Assign a role to an assignee.
   *
   * @param assignment - The assignment type
   * @param role - The role to assign
   * @param assignee - The assignee to assign the role
   */
  assignRole(
    assignment: ReferenceAssignment,
    role: ReferenceIdInterface,
    assignee: ReferenceIdInterface,
  ): Promise<RoleAssignmentEntityInterface>;

  /**
   * Assign multiple roles to an assignee.
   *
   * @param assignment - The assignment type
   * @param roles - The roles to assign
   * @param assignee - The assignee to assign the roles
   */
  assignRoles(
    assignment: ReferenceAssignment,
    roles: ReferenceIdInterface[],
    assignee: ReferenceIdInterface,
  ): Promise<RoleAssignmentEntityInterface[]>;

  /**
   * Revoke a role from an assignee.
   *
   * @param assignment - The assignment type
   * @param role - The role to revoke
   * @param assignee - The assignee from whom the role is to be revoked
   */
  revokeRole(
    assignment: ReferenceAssignment,
    role: ReferenceIdInterface,
    assignee: ReferenceIdInterface,
  ): Promise<void>;

  /**
   * Revoke multiple roles from an assignee.
   *
   * @param assignment - The assignment type
   * @param roles - The roles to revoke
   * @param assignee - The assignee from whom the roles are to be revoked
   */
  revokeRoles(
    assignment: ReferenceAssignment,
    roles: ReferenceIdInterface[],
    assignee: ReferenceIdInterface,
  ): Promise<void>;
}
