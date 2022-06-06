import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import {
  LookupIdInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { ReferenceLookupException } from '../exceptions/reference-lookup.exception';

/**
 * Abstract lookup service
 */
export abstract class LookupService<Entity extends ReferenceIdInterface>
  implements LookupIdInterface<ReferenceId, Entity>
{
  /**
   * Constructor
   *
   * @param repo instance of the repo
   */
  constructor(protected repo: Repository<Entity>) {}

  /**
   * Get entity for the given id.
   *
   * @param id the id
   */
  async byId(id: ReferenceId): Promise<Entity | undefined> {
    return this.findOne({ where: { id } });
  }

  /**
   * Find wrapper.
   *
   * @private
   * @param options Find many options
   */
  protected async find(
    options?: FindManyOptions<Entity>,
  ): Promise<Entity[] | undefined> {
    try {
      // call the repo find
      return this.repo.find(options);
    } catch (e) {
      // fatal orm error
      throw new ReferenceLookupException(this.repo.metadata.name, e);
    }
  }

  /**
   * Find One wrapper.
   *
   * @private
   * @param options Find options
   */
  protected async findOne(
    options?: FindOneOptions<Entity>,
  ): Promise<Entity | undefined> {
    try {
      // call the repo find one
      return this.repo.findOne(options);
    } catch (e) {
      // fatal orm error
      throw new ReferenceLookupException(this.repo.metadata.name, e);
    }
  }
}
