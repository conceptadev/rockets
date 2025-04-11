import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  RemoveOptions,
  Repository,
  SaveOptions,
} from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { RepositoryInterface } from '../interfaces/repository.interface';
import { ReferenceLookupException } from '../exceptions/reference-lookup.exception';

/**
 * Abstract service
 */
export class TypeOrmRepositoryService<Entity extends ReferenceIdInterface>
  implements RepositoryInterface<Entity>
{
  /**
   * Constructor
   *
   * @param repo - instance of the repo
   */
  constructor(private repo: Repository<Entity>) {}

  /**
   * Find wrapper.
   *
   * @param options - Find many options
   */
  async find(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    try {
      // call the repo find
      return this.repo.find(options);
    } catch (e) {
      // fatal orm error
      throw new ReferenceLookupException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  /**
   * Find One wrapper.
   *
   * @param options - Find one options
   */
  async findOne(options: FindOneOptions<Entity>): Promise<Entity | null> {
    try {
      // call the repo find one
      return this.repo.findOne(options);
    } catch (e) {
      // fatal orm error
      // TODO: remove metadata?
      throw new ReferenceLookupException(this.metadata.name, {
        originalError: e,
      });
    }
  }

  /**
   * @internal
   */
  get metadata() {
    return this.repo.metadata;
  }

  //
  // Wrappers
  //
  async findBy(
    where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): Promise<Entity[]> {
    return this.repo.findBy(where);
  }

  async count(options?: FindManyOptions<Entity>): Promise<number> {
    return this.repo.count(options);
  }

  create(entityLike: DeepPartial<Entity>): Entity {
    return this.repo.create(entityLike);
  }

  async save<T extends DeepPartial<Entity>>(
    entities: T | T[],
    options?: SaveOptions,
  ): Promise<(T & Entity) | (T & Entity)[]> {
    if (Array.isArray(entities)) {
      return this.repo.save(entities, options);
    } else {
      return this.repo.save(entities, options);
    }
  }

  async update(
    ...params: Parameters<Repository<Entity>['update']>
  ): ReturnType<Repository<Entity>['update']> {
    return this.repo.update(...params);
  }

  async remove(entities: Entity[], options?: RemoveOptions): Promise<Entity[]>;
  async remove(entity: Entity, options?: RemoveOptions): Promise<Entity>;
  async remove(
    entity: Entity | Entity[],
    removeOptions?: RemoveOptions,
  ): Promise<Entity | Entity[]> {
    if (Array.isArray(entity)) {
      return this.repo.remove(entity, removeOptions);
    } else {
      return this.repo.remove(entity, removeOptions);
    }
  }

  async delete(
    ...params: Parameters<Repository<Entity>['delete']>
  ): ReturnType<Repository<Entity>['delete']> {
    return this.repo.delete(...params);
  }

  merge(
    mergeIntoEntity: Entity,
    ...entityLikes: DeepPartial<Entity>[]
  ): Entity {
    return this.repo.merge(mergeIntoEntity, ...entityLikes);
  }
}
