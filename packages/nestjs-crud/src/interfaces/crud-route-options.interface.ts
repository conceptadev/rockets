import { Type } from '@nestjs/common';
import {
  ApiOperationOptions,
  ApiParamOptions,
  ApiQueryOptions,
  ApiResponseOptions,
} from '@nestjs/swagger';
import {
  CreateOneRouteOptions,
  DeleteOneRouteOptions,
  RecoverOneRouteOptions,
  ReplaceOneRouteOptions,
  UpdateOneRouteOptions,
} from '@nestjsx/crud';
import { CrudValidationOptions } from '../crud.types';
import { CrudSerializationOptionsInterface } from './crud-serialization-options.interface';

export interface CrudRouteOptionsInterface {
  path?: string | string[];
  validation?: CrudValidationOptions;
  serialization?: CrudSerializationOptionsInterface;
  api?: {
    operation?: ApiOperationOptions;
    query?: ApiQueryOptions[];
    params?: ApiParamOptions;
    response?: ApiResponseOptions;
  };
}

export interface CrudRouteDtoOptionsInterface {
  dto?: Type;
}

export interface CrudCreateManyOptionsInterface
  extends CrudRouteOptionsInterface,
    CrudRouteDtoOptionsInterface {}

export interface CrudCreateOneOptionsInterface
  extends CrudRouteOptionsInterface,
    Pick<CreateOneRouteOptions, 'returnShallow'>,
    CrudRouteDtoOptionsInterface {}

export interface CrudReadAllOptionsInterface
  extends CrudRouteOptionsInterface {}

export interface CrudReadOneOptionsInterface
  extends CrudRouteOptionsInterface {}

export interface CrudUpdateOneOptionsInterface
  extends CrudRouteOptionsInterface,
    Pick<UpdateOneRouteOptions, 'returnShallow'>,
    CrudRouteDtoOptionsInterface {}

export interface CrudReplaceOneOptionsInterface
  extends CrudRouteOptionsInterface,
    Pick<ReplaceOneRouteOptions, 'returnShallow'>,
    CrudRouteDtoOptionsInterface {}

export interface CrudDeleteOneOptionsInterface
  extends CrudRouteOptionsInterface,
    Pick<DeleteOneRouteOptions, 'returnDeleted'> {}

export interface CrudRecoverOneOptionsInterface
  extends CrudRouteOptionsInterface,
    Pick<RecoverOneRouteOptions, 'returnRecovered'> {}
