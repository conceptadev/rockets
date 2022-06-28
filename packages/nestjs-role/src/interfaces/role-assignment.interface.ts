import {
  ReferenceAssigneeInterface,
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface RoleAssignmentInterface
  extends ReferenceIdInterface,
    ReferenceAuditInterface,
    ReferenceAssigneeInterface {
  /**
   * Role
   */
  role: ReferenceIdInterface;
}
