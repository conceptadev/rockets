import { ApiBody, ApiBodyOptions } from '@nestjs/swagger';
import { DecoratorTargetObject } from '../../crud.types';

/**
 * \@CrudApiBody() open api decorator
 */
export function CrudApiBody(options?: ApiBodyOptions): MethodDecorator {
  return (classTarget: DecoratorTargetObject, ...rest) => {
    const [propertyKey] = rest;

    if ('__proto__' in classTarget) {
      // need the descriptor
      const descriptor = Object.getOwnPropertyDescriptor(
        classTarget,
        propertyKey,
      );

      // sanity check
      if (!descriptor) {
        throw new Error('Did not find property descriptor');
      }

      ApiBody(options ?? {})(classTarget.prototype, propertyKey, descriptor);
    } else {
      throw new Error('Cannot decorate with api body, target must be a class');
    }
  };
}
