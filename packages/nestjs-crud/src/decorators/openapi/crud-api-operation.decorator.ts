import { ApiOperation, ApiOperationOptions } from '@nestjs/swagger';
import { DecoratorTargetObject } from '../../crud.types';

/**
 * \@CrudApiOperation() open api decorator
 */
export function CrudApiOperation(
  options?: ApiOperationOptions,
): MethodDecorator {
  return (classTarget: DecoratorTargetObject, ...rest) => {
    const [propertyKey] = rest;

    if ('__proto__' in classTarget) {
      const className = classTarget.constructor.name;
      const operationId: string = `${className}_${propertyKey.toString()}`;

      const mergedOptions: ApiOperationOptions = {
        operationId,
        ...options,
      };

      // need the descriptor
      const descriptor = Object.getOwnPropertyDescriptor(
        classTarget,
        propertyKey,
      );

      // sanity check
      if (!descriptor) {
        throw new Error('Did not find property descriptor');
      }

      ApiOperation(mergedOptions)(
        classTarget.prototype,
        propertyKey,
        descriptor,
      );
    } else {
      throw new Error(
        'Cannot decorate with api operation, target must be a class',
      );
    }
  };
}
