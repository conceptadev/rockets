import {
  ReferenceAssigneeInterface,
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { RoleInterface } from '@concepta/ts-common';

export interface RoleAssignmentEntityInterface
  extends ReferenceIdInterface,
    ReferenceAuditInterface,
    ReferenceAssigneeInterface {
  /**
   * Role
   */
  role: RoleInterface;
}
