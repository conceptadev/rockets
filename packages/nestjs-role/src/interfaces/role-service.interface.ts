import { ReferenceAssignment, ReferenceIdInterface } from '@concepta/ts-core';
import { RoleInterface } from '@concepta/ts-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';

import { RoleEntityInterface } from './role-entity.interface';

export interface RoleServiceInterface {
  /**
   * Get all roles for assignee.
   *
   * @param assignment The assignment of the check (same as entity key)
   * @param assignee The assignee to check
   */
  getAssignedRoles(
    assignment: ReferenceAssignment,
    assignee: ReferenceIdInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<RoleEntityInterface[]>;

  /**
   * Check if the assignee is a member of one role.
   *
   * @param assignment The assignment of the check
   * @param role The role to check
   * @param assignee The assignee to check
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
   * @param assignment The assignment of the check
   * @param roles The roles to check
   * @param assignee The assignee to check
   */
  isAssignedRoles<T extends ReferenceIdInterface>(
    assignment: ReferenceAssignment,
    roles: ReferenceIdInterface[],
    assignee: T,
    queryOptions?: QueryOptionsInterface,
  ): Promise<boolean>;
}
