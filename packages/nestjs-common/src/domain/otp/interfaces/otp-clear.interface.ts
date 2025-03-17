import { ReferenceQueryOptionsInterface } from '../../../reference/interfaces/reference-query-options.interface';
import { ReferenceAssignment } from '../../../reference/interfaces/reference.types';
import { OtpInterface } from './otp.interface';

export interface OtpClearInterface<
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  /**
   * Clear all otps for assign in given category.
   *
   * @param assignment - The assignment of the repository
   * @param otp - The otp to clear
   */
  clear(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category'>,
    options?: O,
  ): Promise<void>;
}
