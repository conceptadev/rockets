import {
  AuditInterface,
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { RoleInterface } from '@concepta/nestjs-common';

export interface RoleAssignmentEntityInterface
  extends ReferenceIdInterface,
    ReferenceAssigneeInterface,
    AuditInterface {
  /**
   * Role
   */
  role: RoleInterface;
}
