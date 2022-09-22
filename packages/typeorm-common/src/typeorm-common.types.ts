import { EntityManager } from 'typeorm';

export type RunInTransactionCallback<T> = (
  entityManager: EntityManager | undefined,
) => Promise<T>;
