import { EntityManagerInterface } from './interfaces/entity-manager-repository.interface';

export type RunInTransactionCallback<T> = (
  entityManager: EntityManagerInterface | undefined,
) => Promise<T>;
