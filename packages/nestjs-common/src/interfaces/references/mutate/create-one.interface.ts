import { ReferenceIdInterface } from '../reference-id.interface';

export interface CreateOneInterface<T, U = ReferenceIdInterface> {
  create: (object: T) => Promise<U>;
}
