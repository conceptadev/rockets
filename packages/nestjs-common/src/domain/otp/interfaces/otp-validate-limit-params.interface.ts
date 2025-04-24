import { AssigneeRelationInterface } from '../../assignee/interfaces/assignee-relation.interface';
import { OtpCreatableInterface } from './otp-creatable.interface';
import { OtpParamsInterface } from './otp-params.interface';

export interface OtpValidateLimitParamsInterface
  extends Pick<OtpParamsInterface, 'assignment'>,
    Pick<OtpCreatableInterface, 'category'>,
    Partial<Pick<OtpCreatableInterface, 'rateSeconds' | 'rateThreshold'>>,
    AssigneeRelationInterface {}
