import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceEmail } from '../../../reference/interfaces/reference.types';

export interface ByEmailInterface<
  T = ReferenceEmail,
  U = ReferenceIdInterface,
> {
  byEmail: (email: T) => Promise<U | null>;
}
