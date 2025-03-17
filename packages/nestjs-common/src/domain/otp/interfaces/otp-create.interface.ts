import { ReferenceQueryOptionsInterface } from '../../../reference/interfaces/reference-query-options.interface';
import { OtpCreateParamsInterface } from './otp-create-params.interface';
import { OtpInterface } from './otp.interface';

export interface OtpCreateInterface<
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  /**
   * Create a otp with a for the given assignee.
   *
   * @param params - The otp params
   */
  create(params: OtpCreateParamsInterface<O>): Promise<OtpInterface>;
}
