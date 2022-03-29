import { IdentityEmail } from '../../identity/identity.types';
import { IdentityEmailInterface } from '../identity/identity-email.interface';

export interface LookupEmailInterface<
  T = IdentityEmail,
  U = IdentityEmailInterface,
> {
  byEmail: (email: T) => Promise<U>;
}
