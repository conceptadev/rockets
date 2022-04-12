import { ReferenceId } from '../../../references/reference.types';
import { ReferenceIdInterface } from '../reference-id.interface';

export interface DeleteOneInterface<T = ReferenceId, U = ReferenceIdInterface> {
  delete: (id: T) => Promise<U | void>;
}
