import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { Type } from '../utils/interfaces/type.interface';
import { DeepPartial } from '../utils/deep-partial';
import { ReferenceIdInterface } from '../reference/interfaces/reference-id.interface';
import { RepositoryInterface } from '../repository/interfaces/repository.interface';
import { RepositoryInternals } from '../repository/interfaces/repository-internals';
import { ModelIdNoMatchException } from './exceptions/model-id-no-match.exception';
import { ModelValidationException } from './exceptions/model-validation.exception';
import { ModelMutateException } from './exceptions/model-mutate.exception';
import { ModelServiceInterface } from './interfaces/model-service.interface';

/**
 * Abstract mutate service
 */
export abstract class ModelService<
  Entity extends ReferenceIdInterface,
  Creatable extends DeepPartial<Entity>,
  Updatable extends DeepPartial<Entity> & ReferenceIdInterface<Entity['id']>,
  Replaceable extends Creatable & Pick<Entity, 'id'> = Creatable &
    Pick<Entity, 'id'>,
  Removable extends Pick<Entity, 'id'> = Pick<Entity, 'id'>,
> implements
    ModelServiceInterface<Entity, Creatable, Updatable, Replaceable, Removable>
{
  protected abstract createDto: Type<Creatable>;
  protected abstract updateDto: Type<Updatable>;

  /**
   * Constructor
   *
   * @param repo - instance of the repo
   */
  constructor(protected repo: RepositoryInterface<Entity>) {}

  /**
   * Greater than
   */
  gt<T>(value: T) {
    return this.repo.gt(value);
  }

  /**
   * Greater than or equal
   */
  gte<T>(value: T) {
    return this.repo.gte(value);
  }

  /**
   * Less than or equal
   */
  lt<T>(value: T) {
    return this.repo.lt(value);
  }

  /**
   * Less than
   */
  lte<T>(value: T) {
    return this.repo.lte(value);
  }

  /**
   * Find
   *
   * @param options - Find many options
   */
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
  async byId(id: Entity['id']): Promise<Entity | null> {
    return this.repo.findOne({
      where: { id },
    } as RepositoryInternals.FindOneOptions<Entity>);
  }

  /**
   * Create one
   *
   * @param data - the reference to create
   * @returns the created reference
   */
  async create(data: Creatable): Promise<Entity> {
    // validate the data
    const dto = await this.validate<Creatable>(this.createDto, data);
    // apply transformations
    const transformed = await this.transform(dto);
    // create new entity
    const entity = this.repo.create(transformed);
    // try to save the entity
    return this.save(entity);
  }

  /**
   * Update one
   *
   * @param data - the reference data to update
   * @returns the updated reference
   */
  async update(data: Updatable): Promise<Entity> {
    // the entity we will update
    const entity = await this.findByIdOrFail(data.id);
    // yes, validate the data
    const dto = await this.validate<Updatable>(this.updateDto, data);
    // apply transformations
    const transformed = await this.transform(dto);
    // merge changes into the entity
    const mergedEntity = this.repo.merge(entity, transformed);
    // try to save it
    return this.save(mergedEntity);
  }

  /**
   * Replace one
   *
   * @param data - the reference data to replace
   * @returns the replaced reference
   */
  async replace(data: Replaceable): Promise<Entity> {
    // the entity we will replace
    const entity = await this.findByIdOrFail(data.id);
    // yes, validate the data
    const dto = await this.validate<Creatable>(this.createDto, data);
    // apply transformations
    const transformed = await this.transform(dto);
    // merge changes into the entity
    const mergedEntity = this.repo.merge(entity, transformed);
    // try to save it
    return this.save(mergedEntity);
  }

  /**
   * Remove one
   *
   * @param data - the reference data to remove
   * @returns the removed reference
   */
  async remove(data: Removable): Promise<Entity> {
    // try to find it
    const entity = await this.findByIdOrFail(data.id);
    // try to remove it
    return this.delete(entity);
  }

  /**
   * @internal
   */
  private async save(entity: Entity): Promise<Entity> {
    // try to save it
    try {
      return await this.repo.save(entity);
    } catch (e) {
      throw new ModelMutateException(this.repo.entityName(), {
        originalError: e,
      });
    }
  }

  /**
   * @internal
   */
  private async delete(entity: Entity): Promise<Entity> {
    // try to save it
    try {
      return await this.repo.remove(entity);
    } catch (e) {
      throw new ModelMutateException(this.repo.entityName(), {
        originalError: e,
      });
    }
  }

  /**
   * @internal
   */
  protected async validate<T extends DeepPartial<Entity>>(
    type: Type<T>,
    data: T,
  ): Promise<T> {
    // convert to dto
    const dto = plainToInstance(type, data);

    // validate the data
    const validationErrors = await validate(dto);

    // any errors?
    if (validationErrors?.length) {
      // yes, throw error
      throw new ModelValidationException(
        this.repo.entityName(),
        validationErrors,
      );
    }

    return dto;
  }

  /**
   * @internal
   */
  protected async transform(
    data: DeepPartial<Entity>,
  ): Promise<DeepPartial<Entity>> {
    return data;
  }

  /**
   * @internal
   */
  protected async findByIdOrFail(id: Entity['id']): Promise<Entity> {
    // try to find the ref
    const entity = await this.byId(id);

    // did we get one?
    if (entity) {
      return entity;
    } else {
      throw new ModelIdNoMatchException(this.repo.entityName(), id);
    }
  }
}
