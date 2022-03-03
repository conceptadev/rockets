import { ControllerOptions } from '@nestjs/common';
import { ParamsOptions } from '@nestjsx/crud-request';
import { CrudValidationOptions } from '../crud.types';
import { CrudModelOptionsInterface } from './crud-model-options.interface';
import { CrudSerializeOptionsInterface } from './crud-serialize-options.interface';

export interface CrudControllerOptionsInterface extends ControllerOptions {
  model: CrudModelOptionsInterface;
  params?: ParamsOptions;
  validation?: CrudValidationOptions;
  serialize?: CrudSerializeOptionsInterface;
}
