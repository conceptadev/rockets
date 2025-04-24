import { ReferenceAssignment } from '../../../reference/interfaces/reference.types';
import { OtpCreatableInterface } from './otp-creatable.interface';

export interface OtpParamsInterface {
  assignment: ReferenceAssignment;
  otp: OtpCreatableInterface;
}
