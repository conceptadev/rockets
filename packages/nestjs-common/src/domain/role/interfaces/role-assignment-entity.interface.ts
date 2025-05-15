import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { AssigneeRelationInterface } from '../../assignee/interfaces/assignee-relation.interface';
import { RoleRelationInterface } from './role-relation.interface';

export interface RoleAssignmentEntityInterface
  extends ReferenceIdInterface,
    AuditInterface,
    AssigneeRelationInterface,
    RoleRelationInterface {}
