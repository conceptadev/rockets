import { CreateManyDto } from '@nestjsx/crud';
import { IdentityInterface } from '@rockts-org/nestjs-common';
import { CrudRequestInterface } from '../interfaces/crud-request.interface';
import { CrudResponseManyInterface } from './crud-response-many.interface';

export interface CrudControllerInterface<T extends IdentityInterface> {
  readAll?: (
    crudRequest: CrudRequestInterface,
  ) => Promise<CrudResponseManyInterface<T> | T[]>;

  readOne?: (crudRequest: CrudRequestInterface) => Promise<T>;

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
