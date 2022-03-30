import { IdentityReference } from '../../identity/identity.types';

/**
 * Identifiable by stored reference.
 *
 * @see https://en.wikipedia.org/wiki/Reference_(computer_science)
 */
export interface IdentityReferenceInterface<T = IdentityReference> {
  id: T;
}
