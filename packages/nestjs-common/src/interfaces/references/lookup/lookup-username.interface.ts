import { ReferenceUsername } from '../../../references/reference.types';
import { ReferenceUsernameInterface } from '../reference-username.interface';

export interface LookupUsernameInterface<
  T = ReferenceUsername,
  U = ReferenceUsernameInterface,
> {
  byUsername: (username: T) => Promise<U>;
}
