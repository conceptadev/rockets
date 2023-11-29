import {
  AuditInterface,
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface RoleAssignmentInterface
  extends ReferenceIdInterface,
    AuditInterface,
    ReferenceAssigneeInterface {
  /**
   * Role
   */
  role: ReferenceIdInterface;
}
