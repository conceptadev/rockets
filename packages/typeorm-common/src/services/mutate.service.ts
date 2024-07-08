import { DeepPartial, FindOneOptions, Repository } from 'typeorm';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CreateOneInterface,
  RemoveOneInterface,
  ReferenceIdInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
  Type,
} from '@concepta/ts-core';

import { QueryOptionsInterface } from '../interfaces/query-options.interface';
import { ReferenceValidationException } from '../exceptions/reference-validation.exception';
import { ReferenceMutateException } from '../exceptions/reference-mutate.exception';
import { ReferenceIdNoMatchException } from '../exceptions/reference-id-no-match.exception';
import { BaseService } from './base.service';

/**
 * Abstract mutate service
 */
export abstract class MutateService<
    Entity extends ReferenceIdInterface,
    Creatable extends DeepPartial<Entity>,
    Updatable extends DeepPartial<Entity>,
    Replaceable extends Creatable = Creatable,
    Removable extends DeepPartial<Entity> = DeepPartial<Entity>,
  >
  extends BaseService<Entity>
  implements
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
   * @param repo - instance of the repo
   */
  constructor(repo: Repository<Entity>) {
    super(repo);
  }

  /**
   * Create one
   *
   * @param data - the reference to create
   * @returns the created reference
   */
  async create(
    data: Creatable,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Entity> {
    // validate the data
    const dto = await this.validate<Creatable>(this.createDto, data);
    // apply transformations
    const transformed = await this.transform(dto);
    // create new entity
    const entity = this.repository(queryOptions).create(transformed);
    // try to save the entity
    return this.save(entity, queryOptions);
  }

  /**
   * Update one
   *
   * @param data - the reference data to update
   * @returns the updated reference
   */
  async update(
    data: Updatable & ReferenceIdInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Entity> {
    // the entity we will update
    const entity = await this.findById(data.id);
    // yes, validate the data
    const dto = await this.validate<Updatable>(this.updateDto, data);
    // apply transformations
    const transformed = await this.transform(dto);
    // merge changes into the entity
    const mergedEntity = this.repository(queryOptions).merge(
      entity,
      transformed,
    );
    // try to save it
    return this.save(mergedEntity, queryOptions);
  }

  /**
   * Replace one
   *
   * @param data - the reference data to replace
   * @returns the replaced reference
   */
  async replace(
    data: Replaceable & ReferenceIdInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Entity> {
    // the entity we will replace
    const entity = await this.findById(data.id);
    // yes, validate the data
    const dto = await this.validate<Creatable>(this.createDto, data);
    // apply transformations
    const transformed = await this.transform(dto);
    // merge changes into the entity
    const mergedEntity = this.repository(queryOptions).merge(
      entity,
      transformed,
    );
    // try to save it
    return this.save(mergedEntity, queryOptions);
  }

  /**
   * Remove one
   *
   * @param data - the reference data to remove
   * @param queryOptions - query options
   * @returns the removed reference
   */
  async remove(
    data: Removable & ReferenceIdInterface,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Entity> {
    // try to find it
    const entity = await this.findById(data.id);
    // try to remove it
    return this.delete(entity, queryOptions);
  }

  /**
   * @internal
   */
  private async save(
    entity: Entity,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Entity> {
    // try to save it
    try {
      return this.repository(queryOptions).save(entity);
    } catch (e) {
      throw new ReferenceMutateException(this.metadata.name, e);
    }
  }

  /**
   * @internal
   */
  private async delete(
    entity: Entity,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Entity> {
    // try to save it
    try {
      return this.repository(queryOptions).remove(entity);
    } catch (e) {
      throw new ReferenceMutateException(this.metadata.name, e);
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
    if (validationErrors.length) {
      // yes, throw error
      throw new ReferenceValidationException(
        this.metadata.name,
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
    _queryOptions?: QueryOptionsInterface,
  ): Promise<DeepPartial<Entity>> {
    return data;
  }

  /**
   * @internal
   */
  protected async findById(
    id: string,
    queryOptions?: QueryOptionsInterface,
  ): Promise<Entity> {
    // try to find the ref
    // TODO: remove this type assertion when fix is released
    // https://github.com/typeorm/typeorm/issues/8939
    const entity = await this.findOne(
      {
        where: { id },
      } as FindOneOptions<Entity>,
      queryOptions,
    );

    // did we get one?
    if (entity) {
      return entity;
    } else {
      throw new ReferenceIdNoMatchException(this.metadata.name, id);
    }
  }
}
