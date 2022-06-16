import {
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { RoleAssignableInterface } from './role-assignable.interface';
import { RoleInterface } from './role.interface';
import { RoleAssigneeInterface } from './role-assignee.interface';

export interface RoleAssignmentEntityInterface
  extends ReferenceIdInterface,
    ReferenceAuditInterface,
    RoleAssignableInterface {
  /**
   * Role
   */
  role: RoleInterface;

  /**
   * Assignee
   */
  assignee: RoleAssigneeInterface;
}
