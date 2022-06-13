import { CreateManyDto } from '@nestjsx/crud';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { CrudRequestInterface } from '../interfaces/crud-request.interface';
import { CrudResponsePaginatedInterface } from './crud-response-paginated.interface';
import { DeepPartial } from 'typeorm';

export interface CrudControllerInterface<
  Entity extends ReferenceIdInterface,
  Creatable extends DeepPartial<Entity>,
  Updatable extends DeepPartial<Entity>,
  Replaceable extends Creatable = Creatable,
> {
  getMany?: (
    crudRequest: CrudRequestInterface,
  ) => Promise<CrudResponsePaginatedInterface<Entity> | Entity[]>;

  getOne?: (crudRequest: CrudRequestInterface) => Promise<Entity>;

  createOne?: (
    crudRequest: CrudRequestInterface,
    dto: Creatable,
  ) => Promise<Entity>;

  createMany?: (
    crudRequest: CrudRequestInterface,
    dto: CreateManyDto<Creatable>,
  ) => Promise<Entity[]>;

  updateOne?: (
    crudRequest: CrudRequestInterface,
    dto: Updatable,
  ) => Promise<Entity>;

  replaceOne?: (
    crudRequest: CrudRequestInterface,
    dto: Replaceable,
  ) => Promise<Entity>;

  deleteOne?: (crudRequest: CrudRequestInterface) => Promise<Entity | void>;

  recoverOne?: (crudRequest: CrudRequestInterface) => Promise<Entity>;
}
