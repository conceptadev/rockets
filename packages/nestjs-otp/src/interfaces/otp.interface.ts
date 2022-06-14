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
   * Type of the passCode
   */
  type: string;

  /**
   * passCode
   */
  passCode: string;
}
