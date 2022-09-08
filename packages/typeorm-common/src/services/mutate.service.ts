import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';
import {
  CreateOneInterface,
  RemoveOneInterface,
  ReferenceIdInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
  Type,
} from '@concepta/ts-core';

import { ReferenceValidationException } from '../exceptions/reference-validation.exception';
import { ReferenceMutateException } from '../exceptions/reference-mutate.exception';
import { ReferenceIdNoMatchException } from '../exceptions/reference-id-no-match.exception';
import { ReferenceLookupException } from '../exceptions/reference-lookup.exception';

/**
 * Abstract mutate service
 */
export abstract class MutateService<
  Entity extends ReferenceIdInterface,
  Creatable extends DeepPartial<Entity>,
  Updatable extends DeepPartial<Entity>,
  Replaceable extends Creatable = Creatable,
  Removable extends DeepPartial<Entity> = DeepPartial<Entity>,
> implements
    CreateOneInterface<Creatable, Entity>,
    UpdateOneInterface<Updatable & ReferenceIdInterface, Entity>,
    ReplaceOneInterface<Replaceable & ReferenceIdInterface, Entity>,
    RemoveOneInterface<Removable & ReferenceIdInterface, Entity>
{
  protected abstract createDto: Type<Creatable>;
  protected abstract updateDto: Type<Updatable>;

  /**
   * Constructor
   *
   * @param repo instance of the repo
   */
  constructor(protected repo: Repository<Entity>) {}

  /**
   * Create one
   *
   * @param data the reference to create
   * @returns the created reference
   */
  async create(data: Creatable): Promise<Entity> {
    // validate the data
    const dto = await this.validate<Creatable>(this.createDto, data);
    // create new entity
    const entity = this.repo.create(dto);
    // try to save the entity
    return this.save(entity);
  }

  /**
   * Update one
   *
   * @param data the reference data to update
   * @returns the updated reference
   */
  async update(data: Updatable & ReferenceIdInterface): Promise<Entity> {
    // the entity we will update
    const entity = await this.findById(data.id);
    // yes, validate the data
    const dto = await this.validate<Updatable>(this.updateDto, data);
    // merge changes into the entity
    const mergedEntity = this.repo.merge(entity, dto);
    // try to save it
    return this.save(mergedEntity);
  }

  /**
   * Replace one
   *
   * @param data the reference data to replace
   * @returns the replaced reference
   */
  async replace(data: Replaceable & ReferenceIdInterface): Promise<Entity> {
    // the entity we will replace
    const entity = await this.findById(data.id);
    // yes, validate the data
    const dto = await this.validate<Creatable>(this.createDto, data);
    // merge changes into the entity
    const mergedEntity = this.repo.merge(entity, dto);
    // try to save it
    return this.save(mergedEntity);
  }

  /**
   * Remove one
   *
   * @param data the reference data to remove
   * @returns the removed reference
   */
  async remove(data: Removable & ReferenceIdInterface): Promise<Entity> {
    // try to find it
    const entity = await this.findById(data.id);
    // try to remove it
    return this.delete(entity);
  }

  /**
   * @private
   */
  protected async findById(id: string): Promise<Entity> {
    let entity: Entity | null;
    try {
      // try to find the ref
      // TODO: remove this type assertion when fix is released
      // https://github.com/typeorm/typeorm/issues/8939
      entity = await this.repo.findOne({
        where: { id },
      } as FindOneOptions<Entity>);
    } catch (e) {
      throw new ReferenceLookupException(this.repo.metadata.name, e);
    }
    // did we get one?
    if (entity) {
      return entity;
    } else {
      throw new ReferenceIdNoMatchException(this.repo.metadata.name, id);
    }
  }

  /**
   * @private
   */
  protected async save(entity: Entity): Promise<Entity> {
    // try to save it
    try {
      return this.repo.save(entity);
    } catch (e) {
      throw new ReferenceMutateException(this.repo.metadata.name, e);
    }
  }

  /**
   * @private
   */
  protected async delete(entity: Entity): Promise<Entity> {
    // try to save it
    try {
      return this.repo.remove(entity);
    } catch (e) {
      throw new ReferenceMutateException(this.repo.metadata.name, e);
    }
  }
  /**
   * @private
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
    if (validationErrors.length) {
      // yes, throw error
      throw new ReferenceValidationException(
        this.repo.metadata.name,
        validationErrors,
      );
    }

    return dto;
  }
}
