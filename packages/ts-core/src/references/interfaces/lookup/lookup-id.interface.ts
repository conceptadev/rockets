import { ReferenceId } from '../../reference.types';
import { ReferenceIdInterface } from '../reference-id.interface';
import { ReferenceQueryOptionsInterface } from '../reference-query-options.interface';

export interface LookupIdInterface<
  T = ReferenceId,
  U = ReferenceIdInterface,
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  byId: (id: T, options?: O) => Promise<U | null>;
}
