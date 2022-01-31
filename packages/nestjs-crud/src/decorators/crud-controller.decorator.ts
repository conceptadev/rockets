import { applyDecorators, SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_CTRL_OPTIONS_METADATA } from '../crud.constants';
import { CrudCtrlOptionsInterface } from '../interfaces/crud-ctrl-options.interface';
import { CrudControllerValidation } from './crud-controller-validation.decorator';

/**
 * CRUD controller decorator
 *
 * @param {CrudCtrlOptionsInterface} options
 */
export const CrudController = (options: CrudCtrlOptionsInterface) =>
  applyDecorators(
    SetMetadata(CRUD_MODULE_CTRL_OPTIONS_METADATA, options),
    CrudControllerValidation(options),
  );
