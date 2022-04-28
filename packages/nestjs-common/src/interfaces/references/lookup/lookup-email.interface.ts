import { ReferenceEmail } from '../../../references/reference.types';
import { ReferenceIdInterface } from '../reference-id.interface';

export interface LookupEmailInterface<
  T = ReferenceEmail,
  U = ReferenceIdInterface,
> {
  byEmail: (email: T) => Promise<U | undefined>;
}
