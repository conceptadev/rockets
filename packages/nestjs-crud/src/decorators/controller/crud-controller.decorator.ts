import { applyDecorators, Controller } from '@nestjs/common';
import { CrudModel } from '../routes/crud-model.decorator';
import { CrudControllerOptionsInterface } from '../../interfaces/crud-controller-options.interface';
import { CrudValidation } from '../routes/crud-validation.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudInitValidation } from './crud-init-validation.decorator';
import { CrudInitSerialize } from './crud-init-serialize.decorator';

/**
 * CRUD controller decorator
 *
 * This decorator is a helper for calling the most common controller level decorators.
 */
export function CrudController(options: CrudControllerOptionsInterface) {
  // break out options
  const { path, host, ...moreOptions } = options;

  // apply all decorators
  return applyDecorators(
    Controller({ path, host }),
    CrudModel(moreOptions.model),
    CrudValidation(moreOptions.validation),
    CrudSerialize(moreOptions.serialize),
    CrudInitValidation(),
    CrudInitSerialize(),
  );
}
