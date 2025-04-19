import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';

export interface RoleInterface extends ReferenceIdInterface, AuditInterface {
  /**
   * Name
   */
  name: string;

  /**
   * Name
   */
  description: string;
}
