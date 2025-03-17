import { ReferenceIdInterface } from '../reference-id.interface';
import { ReferenceQueryOptionsInterface } from '../reference-query-options.interface';
import { ReferenceEmail } from '../reference.types';

export interface LookupEmailInterface<
  T = ReferenceEmail,
  U = ReferenceIdInterface,
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  byEmail: (email: T, options?: O) => Promise<U | null>;
}
