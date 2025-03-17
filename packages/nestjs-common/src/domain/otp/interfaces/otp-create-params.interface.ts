import { ReferenceQueryOptionsInterface } from '../../../reference/interfaces/reference-query-options.interface';
import { OtpCreatableInterface } from './otp-creatable.interface';
import { OtpParamsInterface } from './otp-params.interface';

export interface OtpCreateParamsInterface<
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> extends Pick<OtpParamsInterface, 'assignment' | 'otp'>,
    Partial<Pick<OtpCreatableInterface, 'rateSeconds' | 'rateThreshold'>> {
  queryOptions?: O;
  clearOnCreate?: boolean;
}
