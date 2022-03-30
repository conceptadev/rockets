import { IdentityReference } from '../../identity/identity.types';
import { IdentityReferenceInterface } from '../identity/identity-reference.interface';

export interface LookupReferenceInterface<
  T = IdentityReference,
  U = IdentityReferenceInterface,
> {
  byRef: (ref: T) => Promise<U>;
}
