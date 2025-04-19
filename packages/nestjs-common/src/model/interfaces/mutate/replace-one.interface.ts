import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceIdRequired } from '../../../reference/reference.types';

export interface ReplaceOneInterface<
  T extends Partial<ReferenceIdInterface>,
  U extends Partial<ReferenceIdInterface> = T,
> {
  replace: (object: ReferenceIdRequired<T>) => Promise<U>;
}
