import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceIdRequired } from '../../../reference/reference.types';

export interface UpdateOneInterface<
  T extends Partial<ReferenceIdInterface>,
  U extends Partial<ReferenceIdInterface> = T,
> {
  update: (object: ReferenceIdRequired<T>) => Promise<U>;
}
