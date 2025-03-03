import {
  AuditInterface,
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
  ReferenceRoleInterface,
} from '@concepta/nestjs-common';
import { RoleInterface } from '@concepta/nestjs-common';

export interface RoleAssignmentEntityInterface
  extends ReferenceIdInterface,
    ReferenceAssigneeInterface,
    AuditInterface,
    ReferenceRoleInterface<RoleInterface> {}
