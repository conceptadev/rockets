import { ControllerOptions } from '@nestjs/common';
import { ModelOptions } from '@nestjsx/crud';
import { CrudValidationOptions } from '../crud.types';
import { CrudSerializeOptionsInterface } from './crud-serialize-options.interface';

export interface CrudControllerOptionsInterface extends ControllerOptions {
  model: ModelOptions;
  validation?: CrudValidationOptions;
  serialize?: CrudSerializeOptionsInterface;
}
