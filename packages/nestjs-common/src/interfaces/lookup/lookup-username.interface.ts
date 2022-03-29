import { IdentityUsername } from '../../identity/identity.types';
import { IdentityUsernameInterface } from '../identity/identity-username.interface';

export interface LookupUsernameInterface<
  T = IdentityUsername,
  U = IdentityUsernameInterface,
> {
  byUsername: (username: T) => Promise<U>;
}
