import { OtpCreateParamsInterface } from './otp-create-params.interface';
import { OtpInterface } from './otp.interface';

export interface OtpCreateInterface {
  /**
   * Create a otp with a for the given assignee.
   *
   * @param params - The otp params
   */
  create(params: OtpCreateParamsInterface): Promise<OtpInterface>;
}
