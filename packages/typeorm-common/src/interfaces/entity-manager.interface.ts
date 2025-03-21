import { RepositoryInterface } from './repository.interface';
import { DataSourceInterface } from './data-source.interface';
import { IsolationLevel } from '../types';
import { ObjectLiteral } from 'typeorm';

export interface EntityManagerInterface {
  withRepository<
    Entity extends ObjectLiteral,
    R extends RepositoryInterface<Entity>,
  >(
    repository: R & RepositoryInterface<Entity>,
  ): R;
  readonly connection: DataSourceInterface;

  transaction<T>(
    runInTransaction: (entityManager: EntityManagerInterface) => Promise<T>,
  ): Promise<T>;

  transaction<T>(
    isolationLevel: IsolationLevel,
    runInTransaction: (entityManager: EntityManagerInterface) => Promise<T>,
  ): Promise<T>;
}
