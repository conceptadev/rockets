import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { RoleEntityInterface } from './role-entity.interface';
import { RoleAssignmentEntityInterface } from './role-assignment-entity.interface';
import { AssignmentContext } from './assignment-context';
import { RoleAssignmentParams } from './role-assignment-params';
import { RolesAssignmentParams } from './roles-assignment-params';

export interface RoleServiceInterface {
  /**
   * Get all roles for assignee.
   *
   * @param params - The assignment and assignee of the check (same as entity key)
   */
  getAssignedRoles(
    params: AssignmentContext<ReferenceIdInterface>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<RoleEntityInterface[]>;

  /**
   * Check if the assignee is a member of one role.
   *
   * @param params - The assignment, roles and assignee to check
   * @param queryOptions - Optional query options
   */
  isAssignedRole<T extends ReferenceIdInterface>(
    params: RoleAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean>;

  /**
   * Check if the assignee is a member of every role.
   *
   * @param params - The assignment, roles and assignee to check
   * @param queryOptions - Optional query options
   */
  isAssignedRoles<T extends ReferenceIdInterface>(
    params: RolesAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean>;

  /**
   * Assign a role to an assignee.
   *
   * @param params - The assignment, role and assignee
   * @param queryOptions - Optional query options
   */
  assignRole<T extends ReferenceIdInterface>(
    params: RoleAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<RoleAssignmentEntityInterface>;

  /**
   * Assign multiple roles to an assignee.
   *
   * @param params - The assignment, roles and assignee
   * @param queryOptions - Optional query options
   */
  assignRoles<T extends ReferenceIdInterface>(
    params: RolesAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<RoleAssignmentEntityInterface[]>;

  /**
   * Revoke a role from an assignee.
   *
   * @param params - The assignment, role and assignee
   * @param queryOptions - Optional query options
   */
  revokeRole<T extends ReferenceIdInterface>(
    params: RoleAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void>;

  /**
   * Revoke multiple roles from an assignee.
   *
   * @param params - The assignment, roles and assignee
   * @param queryOptions - Optional query options
   */
  revokeRoles<T extends ReferenceIdInterface>(
    params: RolesAssignmentParams<T>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void>;
}
