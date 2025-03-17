import { ReferenceIdInterface } from '../reference-id.interface';
import { ReferenceQueryOptionsInterface } from '../reference-query-options.interface';

export interface UpdateOneInterface<
  T extends ReferenceIdInterface,
  U extends ReferenceIdInterface = T,
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  update: (object: T, options?: O) => Promise<U>;
}
