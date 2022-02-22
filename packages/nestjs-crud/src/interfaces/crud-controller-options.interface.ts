import { ControllerOptions } from '@nestjs/common';
import { CrudValidationOptions } from '../crud.types';
import { CrudModelOptionsInterface } from './crud-model-options.interface';
import { CrudSerializeOptionsInterface } from './crud-serialize-options.interface';

export interface CrudControllerOptionsInterface extends ControllerOptions {
  model: CrudModelOptionsInterface;
  validation?: CrudValidationOptions;
  serialize?: CrudSerializeOptionsInterface;
}
