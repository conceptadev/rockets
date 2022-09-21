import { Repository } from 'typeorm';
import { EntityManagerOptionInterface } from '../interfaces/entity-manager-option.interface';
import { QueryOptionsInterface } from '../interfaces/query-options.interface';

export function repositoryToQuery<T>(
  repository: Repository<T>,
  options?: QueryOptionsInterface & EntityManagerOptionInterface,
): Repository<T> {
  if (options?.transaction) {
    return options.transaction.repository(repository);
  } else if (options?.entityManager) {
    const manager = options.entityManager;
    return manager.withRepository<T, Repository<T>>(repository);
  } else {
    return repository;
  }
}
