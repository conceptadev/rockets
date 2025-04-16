import {
  ByIdInterface,
  ReferenceId,
  ReferenceIdInterface,
  RepositoryInterface,
  RepositoryInternals,
} from '@concepta/nestjs-common';

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

  async find(
    options?: RepositoryInternals.FindManyOptions<Entity>,
  ): Promise<Entity[]> {
    return this.repo.find(options);
  }

  /**
   * Get entity for the given id.
   *
   * @param id - the id
   */
  async byId(id: ReferenceId): Promise<Entity | null> {
    return this.repo.findOne({
      where: { id },
    } as RepositoryInternals.FindOneOptions<Entity>);
  }
}
