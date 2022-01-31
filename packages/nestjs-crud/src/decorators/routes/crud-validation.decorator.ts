import { SetMetadata } from '@nestjs/common';
import { CRUD_MODULE_ROUTE_VALIDATION_METADATA } from '../../crud.constants';
import { CrudValidationOptions } from '../../crud.types';

/**
 * @CrudValidation() route decorator
 */
export const CrudValidation = (options: CrudValidationOptions = {}) =>
  SetMetadata(CRUD_MODULE_ROUTE_VALIDATION_METADATA, options);
