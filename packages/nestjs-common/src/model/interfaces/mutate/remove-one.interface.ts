import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceIdRequired } from '../../../reference/reference.types';

export interface RemoveOneInterface<
  T extends Partial<ReferenceIdInterface>,
  U extends Partial<ReferenceIdInterface> = T,
> {
  remove: (object: ReferenceIdRequired<T>) => Promise<U>;
}
