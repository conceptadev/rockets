import { ReferenceUsername } from '../../../references/reference.types';
import { ReferenceIdInterface } from '../reference-id.interface';

export interface LookupUsernameInterface<
  T = ReferenceUsername,
  U = ReferenceIdInterface,
> {
  byUsername: (username: T) => Promise<U | undefined>;
}
