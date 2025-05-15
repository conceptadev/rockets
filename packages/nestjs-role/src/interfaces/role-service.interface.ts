import {
  ReferenceIdInterface,
  RoleAssignmentEntityInterface,
} from '@concepta/nestjs-common';
import { RoleAssignmentContext } from './role-assignment-context';
import { RoleAssignmentOptionsInterface } from './role-assignment-options.interface';
import { RolesAssignmentOptionsInterface } from './roles-assignment-options.interface';

export interface RoleServiceInterface {
  /**
   * Get all roles for assignee.
   *
   * @param options - The assignment and assignee of the check (same as entity key)
   */
  getAssignedRoles(
    options: RoleAssignmentContext<ReferenceIdInterface>,
  ): Promise<ReferenceIdInterface[]>;

  /**
   * Check if the assignee is a member of one role.
   *
   * @param options - The assignment, roles and assignee to check
   */
  isAssignedRole<T extends ReferenceIdInterface>(
    options: RoleAssignmentOptionsInterface<T>,
  ): Promise<boolean>;

  /**
   * Check if the assignee is a member of every role.
   *
   * @param options - The assignment, roles and assignee to check
   */
  isAssignedRoles<T extends ReferenceIdInterface>(
    options: RolesAssignmentOptionsInterface<T>,
  ): Promise<boolean>;

  /**
   * Assign a role to an assignee.
   *
   * @param options - The assignment, role and assignee
   */
  assignRole<T extends ReferenceIdInterface>(
    options: RoleAssignmentOptionsInterface<T>,
  ): Promise<RoleAssignmentEntityInterface>;

  /**
   * Assign multiple roles to an assignee.
   *
   * @param options - The assignment, roles and assignee
   */
  assignRoles<T extends ReferenceIdInterface>(
    options: RolesAssignmentOptionsInterface<T>,
  ): Promise<RoleAssignmentEntityInterface[]>;

  /**
   * Revoke a role from an assignee.
   *
   * @param options - The assignment, role and assignee
   */
  revokeRole<T extends ReferenceIdInterface>(
    options: RoleAssignmentOptionsInterface<T>,
  ): Promise<void>;

  /**
   * Revoke multiple roles from an assignee.
   *
   * @param options - The assignment, roles and assignee
   */
  revokeRoles<T extends ReferenceIdInterface>(
    options: RolesAssignmentOptionsInterface<T>,
  ): Promise<void>;
}
