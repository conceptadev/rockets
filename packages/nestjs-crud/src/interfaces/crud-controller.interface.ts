import { CreateManyDto, GetManyDefaultResponse } from '@nestjsx/crud';
import { CrudRequestInterface } from '../interfaces/crud-request.interface';

export interface CrudControllerInterface<T> {
  getMany?: (
    crudRequest: CrudRequestInterface,
  ) => Promise<GetManyDefaultResponse<T> | T[]>;

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
