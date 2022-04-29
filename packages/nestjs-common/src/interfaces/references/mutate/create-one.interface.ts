import { ReferenceIdInterface } from '../reference-id.interface';

export interface CreateOneInterface<T, U extends ReferenceIdInterface> {
  create: (object: T) => Promise<U>;
}
