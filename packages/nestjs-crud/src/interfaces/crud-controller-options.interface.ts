import { ControllerOptions } from '@nestjs/common';
import { ParamsOptions } from '@nestjsx/crud-request';
import { CrudValidationOptions } from '../crud.types';
import { CrudModelOptionsInterface } from './crud-model-options.interface';
import { CrudQueryOptionsInterface } from './crud-query-options.interface';
import { CrudSerializationOptionsInterface } from './crud-serialization-options.interface';

export interface CrudControllerOptionsInterface extends ControllerOptions {
  model: CrudModelOptionsInterface;
  params?: ParamsOptions;
  validation?: CrudValidationOptions;
  serialization?: CrudSerializationOptionsInterface;
  join?: CrudQueryOptionsInterface['join'];
}
