import {
  ReferenceAssigneeInterface,
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

export interface OtpInterface
  extends ReferenceIdInterface,
    ReferenceAssigneeInterface,
    Partial<ReferenceAuditInterface> {
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
