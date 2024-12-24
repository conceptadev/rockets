import { ReferenceQueryOptionsInterface } from '../../../reference/interfaces/reference-query-options.interface';
import { ReferenceAssignment } from '../../../reference/interfaces/reference.types';
import { OtpCreatableInterface } from './otp-creatable.interface';

export interface OtpCreateParamsInterface<
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  assignment: ReferenceAssignment;
  otp: OtpCreatableInterface;
  queryOptions?: O;
  clearOnCreate?: boolean;
}
