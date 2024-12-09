import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceAssigneeInterface } from '../../../reference/interfaces/reference-assignee.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';

export interface OtpInterface
  extends ReferenceIdInterface,
    ReferenceAssigneeInterface,
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
}
