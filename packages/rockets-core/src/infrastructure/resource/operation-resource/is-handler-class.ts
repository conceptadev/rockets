import type { Type } from '@nestjs/common';

import type {
  CompiledOperationDescriptor,
  OperationHandler,
} from '../../../domain/interfaces/operation-resource.interface';

/**
 * Narrow an operation handler ref to an injectable class (has a `handle`
 * method on its prototype) versus a plain function handler.
 */
export function isHandlerClass(
  handler: CompiledOperationDescriptor['handler'],
): handler is Type<OperationHandler> {
  return (
    typeof handler === 'function' &&
    handler.prototype !== undefined &&
    typeof (handler.prototype as { handle?: unknown }).handle === 'function'
  );
}
