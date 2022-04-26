import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { DeepPartial, ObjectLiteral, Repository } from 'typeorm';
import { Injectable, Type } from '@nestjs/common';
import {
  CreateOneInterface,
  RemoveOneInterface,
  ReferenceIdInterface,
  ReplaceOneInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import { ReferenceValidationException } from '../exceptions/reference-validation.exception';
import { ReferenceMutateException } from '../exceptions/reference-mutate.exception';
import { ReferenceIdNoMatchException } from '../exceptions/reference-id-no-match.exception';
import { ReferenceLookupException } from '../exceptions/reference-lookup.exception';

/**
 * Abstract mutate service
 */
@Injectable()
export abstract class MutateService<
  Entity extends ReferenceIdInterface & ObjectLiteral,
  Creatable extends DeepPartial<Entity>,
  Readable extends ReferenceIdInterface & DeepPartial<Entity>,
  Updatable extends ReferenceIdInterface & DeepPartial<Entity>,
  Replaceable extends ReferenceIdInterface & Creatable = ReferenceIdInterface &
    Creatable,
  Removable extends ReferenceIdInterface = ReferenceIdInterface,
> implements
    CreateOneInterface<Creatable, Readable>,
    UpdateOneInterface<Updatable, Readable>,
    ReplaceOneInterface<Replaceable, Readable>,
    RemoveOneInterface<Removable, Readable>
{
  protected abstract readDto: Type<Readable>;
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
  async create(data: Creatable): Promise<Readable> {
    // validate the data
    const dto = await this.validate<Creatable>(this.createDto, data);
    // try to save the item
    const item = await this.save(dto);
    // transform it
    return this.transform(item);
  }

  /**
   * Update one
   *
   * @param data the reference data to update
   * @returns the updated reference
   */
  async update(data: Updatable): Promise<Readable> {
    // the item we will update
    const item = await this.findById(data.id);
    // yes, validate the data
    const dto = await this.validate<Updatable>(this.updateDto, data);
    // set the id from the found item
    dto.id = item.id;
    // try to save it
    const itemSaved = await this.save(dto);
    // return it
    return this.transform(itemSaved);
  }

  /**
   * Replace one
   *
   * @param data the reference data to replace
   * @returns the replaced reference
   */
  async replace(data: Replaceable): Promise<Readable> {
    // the item we will update
    const item = await this.findById(data.id);
    // yes, remove the item
    const removed = await this.repo.remove(item);
    // yes, validate the data
    const dto = await this.validate<Creatable>(this.createDto, data);
    // add the id from the removed item
    dto.id = removed.id;
    // try to save it
    const itemReplaced = await this.save(dto);
    // return it
    return this.transform(itemReplaced);
  }

  /**
   * Remove one
   *
   * @param data the reference data to remove
   * @returns the removed reference
   */
  async remove(data: Removable): Promise<Readable> {
    // try to find it
    const item = await this.findById(data.id);
    // yes, try to remove it
    const removed = await this.repo.remove(item);
    // was one removed?
    if (removed) {
      // yes, return it
      return this.transform(removed);
    } else {
      // not removed
      throw new ReferenceIdNoMatchException(this.repo.metadata.name, item.id);
    }
  }

  /**
   * @private
   */
  protected async findById(id: ReferenceIdInterface['id']): Promise<Entity> {
    try {
      // try to find the ref
      const item = await this.repo.findOne(id);
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
  protected async save(
    item: DeepPartial<Entity>,
    options = { reload: true },
  ): Promise<Entity> {
    // try to save it
    try {
      return this.repo.save(item, options);
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

  /**
   * @private
   */
  protected transform(item: Entity): Readable {
    return plainToInstance(this.readDto, item);
  }
}
