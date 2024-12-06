import {
  LookupIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { FindOneOptions, Repository } from 'typeorm';
import { QueryOptionsInterface } from '../interfaces/query-options.interface';
import { BaseService } from './base.service';

/**
 * Abstract lookup service
 */
export abstract class LookupService<Entity extends ReferenceIdInterface>
  extends BaseService<Entity>
  implements LookupIdInterface<ReferenceId, Entity, QueryOptionsInterface>
{
  /**
   * Constructor
   *
   * @param repo - instance of the repo
   */
  constructor(repo: Repository<Entity>) {
    super(repo);
  }

  /**
   * Get entity for the given id.
   *
   * @param id - the id
   * @param queryOptions - query options
   */
  async byId(
    id: ReferenceId,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Entity | null> {
    // TODO: remove this type assertion when fix is released
    // https://github.com/typeorm/typeorm/issues/8939
    return this.findOne(
      { where: { id } } as FindOneOptions<Entity>,
      queryOptions,
    );
  }
}
