import { Type } from '@nestjs/common';
import { ApiOperation, ApiOperationOptions } from '@nestjs/swagger';

/**
 * @CrudApiOperation() open api decorator
 */
export function CrudApiOperation(
  options?: ApiOperationOptions,
): MethodDecorator {
  return (target: Type, propertyKey: string | symbol) => {
    const mergedOptions: ApiOperationOptions = {
      operationId: `${target.name}_${propertyKey.toString()}`,
      ...options,
    };

    ApiOperation(mergedOptions);
  };
}
