import { ReferenceEmail } from '../../../references/reference.types';
import { ReferenceEmailInterface } from '../reference-email.interface';

export interface LookupEmailInterface<
  T = ReferenceEmail,
  U = ReferenceEmailInterface,
> {
  byEmail: (email: T) => Promise<U>;
}
