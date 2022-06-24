import {
  ReferenceAssigneeInterface,
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { RoleInterface } from './role.interface';

export interface RoleAssignmentEntityInterface
  extends ReferenceIdInterface,
    ReferenceAuditInterface,
    ReferenceAssigneeInterface {
  /**
   * Role
   */
  role: RoleInterface;
}
