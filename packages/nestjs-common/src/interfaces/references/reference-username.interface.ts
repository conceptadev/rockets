import { ReferenceUsername } from '../../references/reference.types';

/**
 * Identifiable by username.
 */
export interface ReferenceUsernameInterface<T = ReferenceUsername> {
  username: T;
}
