import { ReferenceIdInterface } from '../reference-id.interface';
import { ReferenceQueryOptionsInterface } from '../reference-query-options.interface';

export interface CreateOneInterface<
  T,
  U extends ReferenceIdInterface,
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  create: (object: T, options?: O) => Promise<U>;
}
