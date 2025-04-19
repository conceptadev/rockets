import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceId } from '../../../reference/interfaces/reference.types';
import { RepositoryInternals } from '../../../repository/interfaces/repository-internals';

export interface FindInterface<T = ReferenceId, U = ReferenceIdInterface> {
  find(options?: RepositoryInternals.FindManyOptions<T>): Promise<U[]>;
}
