import { ReferenceAssignment } from '../../../reference/interfaces/reference.types';
import { OtpInterface } from './otp.interface';

export interface OtpDeleteInterface {
  /**
   * Delete a otp based on params
   *
   * @param assignment - The otp assignment
   * @param otp - The otp to delete
   */
  delete(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category' | 'passcode'>,
  ): Promise<void>;
}
