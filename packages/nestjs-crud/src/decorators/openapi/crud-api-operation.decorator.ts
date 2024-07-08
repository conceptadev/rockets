import { ApiOperation, ApiOperationOptions } from '@nestjs/swagger';
import { DecoratorTargetObject } from '../../crud.types';

/**
 * \@CrudApiOperation() open api decorator
 */
export function CrudApiOperation(
  options?: ApiOperationOptions,
): MethodDecorator {
  return (target: DecoratorTargetObject, ...rest) => {
    const [propertyKey] = rest;

    if ('__proto__' in target || 'name' in target) {
      const mergedOptions: ApiOperationOptions = {
        operationId: `${target.name}_${propertyKey.toString()}`,
        ...options,
      };

      ApiOperation(mergedOptions);
    } else {
      throw new Error(
        'Cannot decorate with api operation, target must be a class',
      );
    }
  };
}
