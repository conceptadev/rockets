import { EntityManagerInterface } from './interfaces/entity-manager.interface';

export type RunInTransactionCallback<T> = (
  entityManager: EntityManagerInterface | undefined,
) => Promise<T>;
