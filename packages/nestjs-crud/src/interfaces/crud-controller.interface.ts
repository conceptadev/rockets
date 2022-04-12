import { CreateManyDto } from '@nestjsx/crud';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { CrudRequestInterface } from '../interfaces/crud-request.interface';
import { CrudResponsePaginatedInterface } from './crud-response-paginated.interface';

export interface CrudControllerInterface<T extends ReferenceIdInterface> {
  getMany?: (
    crudRequest: CrudRequestInterface,
  ) => Promise<CrudResponsePaginatedInterface<T> | T[]>;

  getOne?: (crudRequest: CrudRequestInterface) => Promise<T>;

  createOne?: (
    crudRequest: CrudRequestInterface,
    dto: Partial<T>,
  ) => Promise<T>;

  createMany?: (
    crudRequest: CrudRequestInterface,
    dto: CreateManyDto<T>,
  ) => Promise<T[]>;

  updateOne?: (
    crudRequest: CrudRequestInterface,
    dto: Partial<T>,
  ) => Promise<T>;

  replaceOne?: (
    crudRequest: CrudRequestInterface,
    dto: Partial<T>,
  ) => Promise<T>;

  deleteOne?: (crudRequest: CrudRequestInterface) => Promise<T | void>;

  recoverOne?: (crudRequest: CrudRequestInterface) => Promise<T>;
}
