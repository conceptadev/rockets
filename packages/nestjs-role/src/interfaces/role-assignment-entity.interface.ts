import {
  AuditInterface,
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { RoleInterface } from '@concepta/ts-common';

export interface RoleAssignmentEntityInterface
  extends ReferenceIdInterface,
    ReferenceAssigneeInterface,
    AuditInterface {
  /**
   * Role
   */
  role: RoleInterface;
}
