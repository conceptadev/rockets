import { DeepPartial } from 'typeorm';
import { CreateManyDto } from '@nestjsx/crud';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { CrudRequestInterface } from '../interfaces/crud-request.interface';
import { CrudResponsePaginatedInterface } from './crud-response-paginated.interface';
import { AdditionalCrudMethodArgs } from '../crud.types';

export interface CrudControllerInterface<
  Entity extends ReferenceIdInterface,
  Creatable extends DeepPartial<Entity>,
  Updatable extends DeepPartial<Entity>,
  Replaceable extends Creatable = Creatable,
> {
  getMany?: (
    crudRequest: CrudRequestInterface,
    ...rest: AdditionalCrudMethodArgs
  ) => Promise<CrudResponsePaginatedInterface<Entity> | Entity[]>;

  getOne?: (
    crudRequest: CrudRequestInterface,
    ...rest: AdditionalCrudMethodArgs
  ) => Promise<Entity>;

  createOne?: (
    crudRequest: CrudRequestInterface,
    dto: Creatable,
    ...rest: AdditionalCrudMethodArgs
  ) => Promise<Entity>;

  createMany?: (
    crudRequest: CrudRequestInterface,
    dto: CreateManyDto<Creatable>,
    ...rest: AdditionalCrudMethodArgs
  ) => Promise<Entity[]>;

  updateOne?: (
    crudRequest: CrudRequestInterface,
    dto: Updatable,
    ...rest: AdditionalCrudMethodArgs
  ) => Promise<Entity>;

  replaceOne?: (
    crudRequest: CrudRequestInterface,
    dto: Replaceable,
    ...rest: AdditionalCrudMethodArgs
  ) => Promise<Entity>;

  deleteOne?: (
    crudRequest: CrudRequestInterface,
    ...rest: AdditionalCrudMethodArgs
  ) => Promise<Entity | void>;

  recoverOne?: (
    crudRequest: CrudRequestInterface,
    ...rest: AdditionalCrudMethodArgs
  ) => Promise<Entity>;
}
