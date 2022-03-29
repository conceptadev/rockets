import { IdentityEmail } from '../../identity/identity.types';

/**
 * Identifiable by email.
 */
export interface IdentityEmailInterface<T = IdentityEmail> {
  email: T;
}
