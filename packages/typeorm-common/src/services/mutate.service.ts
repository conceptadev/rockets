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
    // try to save the item
    return this.save(dto);
  }

  /**
   * Update one
   *
   * @param data the reference data to update
   * @returns the updated reference
   */
  async update(data: Updatable & ReferenceIdInterface): Promise<Entity> {
    // the item we will update
    const item = await this.findById(data.id);
    // yes, validate the data
    const dto = await this.validate<Updatable>(this.updateDto, data);
    // set the id from the found item
    dto.id = item.id;
    // try to save it
    return this.save(dto);
  }

  /**
   * Replace one
   *
   * @param data the reference data to replace
   * @returns the replaced reference
   */
  async replace(data: Replaceable & ReferenceIdInterface): Promise<Entity> {
    // the item we will update
    const item = await this.findById(data.id);
    // yes, remove the item
    const removed = await this.repo.remove(item);
    // yes, validate the data
    const dto = await this.validate<Creatable>(this.createDto, data);
    // add the id from the removed item
    dto.id = removed.id;
    // try to save it
    return this.save(dto);
  }

  /**
   * Remove one
   *
   * @param data the reference data to remove
   * @returns the removed reference
   */
  async remove(data: Removable & ReferenceIdInterface): Promise<Entity> {
    // try to find it
    const item = await this.findById(data.id);
    // yes, try to remove it
    const removed = await this.repo.remove(item);
    // was one removed?
    if (removed) {
      // yes, return it
      return removed;
    } else {
      // not removed
      throw new ReferenceIdNoMatchException(this.repo.metadata.name, item.id);
    }
  }

  /**
   * @private
   */
  protected async findById(id: string): Promise<Entity> {
    try {
      // try to find the ref
      const item = await this.repo.findOne({
        where: { id },
      } as FindOneOptions<Entity>);
      // did we get one?
      if (item) {
        return item;
      } else {
        throw new ReferenceIdNoMatchException(this.repo.metadata.name, id);
      }
    } catch (e) {
      throw new ReferenceLookupException(this.repo.metadata.name, e);
    }
  }

  /**
   * @private
   */
  protected async save(item: DeepPartial<Entity>): Promise<Entity> {
    // try to save it
    try {
      return this.repo.save(item);
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
