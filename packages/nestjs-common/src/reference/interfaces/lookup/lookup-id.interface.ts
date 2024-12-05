import { ReferenceIdInterface } from '../reference-id.interface';
import { ReferenceQueryOptionsInterface } from '../reference-query-options.interface';
import { ReferenceId } from '../reference.types';

export interface LookupIdInterface<
  T = ReferenceId,
  U = ReferenceIdInterface,
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  byId: (id: T, options?: O) => Promise<U | null>;
}
