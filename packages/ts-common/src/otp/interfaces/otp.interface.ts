import {
  AuditInterface,
  ReferenceAssigneeInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';

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
