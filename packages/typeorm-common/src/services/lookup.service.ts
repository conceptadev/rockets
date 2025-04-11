import {
  ByIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { RepositoryInterface } from '../interfaces/repository.interface';

/**
 * Abstract lookup service
 */
export abstract class LookupService<Entity extends ReferenceIdInterface>
  implements ByIdInterface<ReferenceId, Entity>
{
  /**
   * Constructor
   *
   * @param repo - instance of the repo
   */
  constructor(protected readonly repo: RepositoryInterface<Entity>) {}

  async find(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    return this.repo.find(options);
  }

  /**
   * Get entity for the given id.
   *
   * @param id - the id
   */
  async byId(id: ReferenceId): Promise<Entity | null> {
    // TODO: remove this type assertion when fix is released
    // https://github.com/typeorm/typeorm/issues/8939
    return this.repo.findOne({ where: { id } } as FindOneOptions<Entity>);
  }
}
