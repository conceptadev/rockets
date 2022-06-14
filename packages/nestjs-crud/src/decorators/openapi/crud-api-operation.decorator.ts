import { Type } from '@nestjs/common';
import { ApiOperation, ApiOperationOptions } from '@nestjs/swagger';

/**
 * @CrudApiOperation() open api decorator
 */
export function CrudApiOperation(
  options?: ApiOperationOptions,
): MethodDecorator {
  return (target: Type<Object> | Object, ...rest) => {
    const [propertyKey] = rest;

    if (!('__proto__' in target || 'name' in target)) {
      throw new Error(
        'Cannot decorate with api operation, target must be a class',
      );
    }

    const mergedOptions: ApiOperationOptions = {
      operationId: `${target.name}_${propertyKey.toString()}`,
      ...options,
    };

    ApiOperation(mergedOptions);
  };
}
