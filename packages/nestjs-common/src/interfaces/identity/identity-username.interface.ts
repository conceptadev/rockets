import { IdentityUsername } from '../../identity/identity.types';

/**
 * Identifiable by username.
 */
export interface IdentityUsernameInterface<T = IdentityUsername> {
  username: T;
}
