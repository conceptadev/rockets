import { IdentitySubject } from '../../identity/identity.types';

/**
 * Identifiable by subject (JWT).
 */
export interface IdentitySubjectInterface<T = IdentitySubject> {
  sub: T;
}
