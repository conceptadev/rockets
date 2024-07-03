import {
  ReferenceAssignment,
  ReferenceQueryOptionsInterface,
} from '@concepta/ts-core';
import { OtpInterface } from './otp.interface';

export interface OtpDeleteInterface<
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  /**
   * Delete a otp based on params
   * @param assignment - The otp assignment
   * @param otp - The otp to delete
   */
  delete(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category' | 'passcode'>,
    options?: O,
  ): Promise<void>;
}
