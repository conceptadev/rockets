import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceAssigneeInterface } from '../../../reference/interfaces/reference-assignee.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';

export interface RoleAssignmentInterface
  extends ReferenceIdInterface,
    AuditInterface,
    ReferenceAssigneeInterface {
  /**
   * Role
   */
  role: ReferenceIdInterface;
}
