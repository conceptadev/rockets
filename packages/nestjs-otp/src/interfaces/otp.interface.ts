import {
  ReferenceAuditInterface,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { OtpAssignableInterface } from './otp-assignable.interface';

export interface OtpInterface
  extends ReferenceIdInterface,
    OtpAssignableInterface,
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
