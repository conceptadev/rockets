import { ReferenceIdInterface } from '../reference-id.interface';
import { ReferenceQueryOptionsInterface } from '../reference-query-options.interface';

export interface RemoveOneInterface<
  T extends ReferenceIdInterface,
  U extends ReferenceIdInterface = T,
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  remove: (object: T, options?: O) => Promise<U>;
}
