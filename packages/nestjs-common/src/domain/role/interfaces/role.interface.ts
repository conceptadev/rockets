import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { RoleAssigneesInterface } from './role-assignees.interface';

export interface RoleInterface
  extends ReferenceIdInterface,
    RoleAssigneesInterface,
    AuditInterface {
  /**
   * Name
   */
  name: string;

  /**
   * Name
   */
  description: string;
}
