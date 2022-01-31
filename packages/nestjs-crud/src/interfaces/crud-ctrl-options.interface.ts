import { CrudOptions as xCrudOptions } from '@nestjsx/crud';
import { CrudValidationOptions } from '../crud.types';

export interface CrudCtrlOptionsInterface
  extends Pick<xCrudOptions, 'model' | 'validation'> {
  validation?: CrudValidationOptions;
}
