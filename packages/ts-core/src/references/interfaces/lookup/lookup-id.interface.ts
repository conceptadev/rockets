import { ReferenceId } from '../../reference.types';
import { ReferenceIdInterface } from '../reference-id.interface';

export interface LookupIdInterface<T = ReferenceId, U = ReferenceIdInterface> {
  byId: (id: T) => Promise<U | undefined>;
}
