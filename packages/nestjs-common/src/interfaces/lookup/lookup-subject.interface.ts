import { IdentitySubject } from '../../identity/identity.types';
import { IdentityReferenceInterface } from '../identity/identity-reference.interface';

export interface LookupSubjectInterface<
  T = IdentitySubject,
  U = IdentityReferenceInterface,
> {
  bySubject: (subject: T) => Promise<U>;
}
