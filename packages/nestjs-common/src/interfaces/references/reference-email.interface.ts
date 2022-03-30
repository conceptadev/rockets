import { ReferenceEmail } from '../../references/reference.types';

/**
 * Identifiable by email.
 */
export interface ReferenceEmailInterface<T = ReferenceEmail> {
  email: T;
}
