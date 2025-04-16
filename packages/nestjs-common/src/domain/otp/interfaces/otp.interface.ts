import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { AssigneeRelationInterface } from '../../assignee/interfaces/assignee-relation.interface';

export interface OtpInterface
  extends ReferenceIdInterface,
    AssigneeRelationInterface,
    AuditInterface {
  /**
   * Name
   */
  category: string;

  /**
   * Type of the passcode
   */
  type: string;

  /**
   * Passcode
   */
  passcode: string;

  /**
   * Date it will expire
   */
  expirationDate: Date;

  /**
   * is active status
   */
  active: boolean;
}
