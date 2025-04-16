import {
  AssigneeRelationInterface,
  AuditInterface,
  ReferenceIdInterface,
  RoleRelationInterface,
} from '@concepta/nestjs-common';

export interface RoleAssignmentEntityInterface
  extends ReferenceIdInterface,
    AuditInterface,
    AssigneeRelationInterface,
    RoleRelationInterface {}
