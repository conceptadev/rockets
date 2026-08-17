import type { Type } from '@nestjs/common';

import type {
  CompiledOperationDescriptor,
  OperationHandler,
  OperationHandlerClassRef,
  OperationHandlerFn,
} from '../../../domain/interfaces/operation-resource.interface';

function isClassRef(
  handler: CompiledOperationDescriptor['handler'],
): handler is OperationHandlerClassRef {
  return (
    typeof handler === 'object' &&
    handler !== null &&
    'useClass' in handler &&
    typeof handler.useClass === 'function'
  );
}

function isEsClass(handler: Function): boolean {
  return Function.prototype.toString.call(handler).startsWith('class ');
}

/**
 * Narrow an operation handler ref to an injectable class (has a `handle`
 * method on its prototype, is an ES class with an instance-field `handle`, or
 * uses the explicit `{ useClass }` form) versus a plain function handler.
 */
export function isHandlerClass(
  handler: CompiledOperationDescriptor['handler'],
): handler is Type<OperationHandler<unknown, unknown, object>> {
  return (
    typeof handler === 'function' &&
    handler.prototype !== undefined &&
    (typeof (handler.prototype as { handle?: unknown }).handle === 'function' ||
      isEsClass(handler))
  );
}

export function getHandlerClass(
  handler: CompiledOperationDescriptor['handler'],
): Type<OperationHandler<unknown, unknown, object>> | undefined {
  if (isClassRef(handler)) {
    return handler.useClass;
  }
  return isHandlerClass(handler) ? handler : undefined;
}

export function isHandlerFunction(
  handler: CompiledOperationDescriptor['handler'],
): handler is OperationHandlerFn<unknown, unknown, object> {
  return (
    getHandlerClass(handler) === undefined && typeof handler === 'function'
  );
}
