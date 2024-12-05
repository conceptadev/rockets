import { ReferenceIdInterface } from '../reference-id.interface';
import { ReferenceQueryOptionsInterface } from '../reference-query-options.interface';

export interface ReplaceOneInterface<
  T extends ReferenceIdInterface,
  U extends ReferenceIdInterface = T,
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  replace: (object: T, options?: O) => Promise<U>;
}
