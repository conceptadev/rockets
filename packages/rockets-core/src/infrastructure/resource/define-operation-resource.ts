import type { Provider, Type } from '@nestjs/common';

import { ResourceKind } from '../../domain/interfaces/resource-kind.enum';
import type {
  CompiledOperationDescriptor,
  OperationHandler,
  OperationResource,
  OperationResourceDefinition,
} from '../../domain/interfaces/operation-resource.interface';
import { buildOperationController } from './operation-resource/build-operation-controller';
import { isHandlerClass } from './operation-resource/is-handler-class';

function collectHandlerProviders(
  operations: Readonly<Record<string, CompiledOperationDescriptor>>,
): Provider[] {
  const providers: Provider[] = [];
  const seen = new Set<Type<OperationHandler>>();
  for (const operation of Object.values(operations)) {
    if (!isHandlerClass(operation.handler)) {
      continue;
    }
    if (seen.has(operation.handler)) {
      continue;
    }
    seen.add(operation.handler);
    providers.push(operation.handler);
  }
  return providers;
}

/**
 * Build an {@link OperationResource} for `RocketsCoreModule`'s `resources[]`.
 *
 * Pair with `defineResource` (CRUD) and `defineModuleResource` (hand Nest
 * slice). Use this when the route is a typed non-CRUD operation with Zod /
 * DTO input-output and a custom handler.
 *
 * Prefer the zod helpers `operationResource` / `query` / `command` from
 * `@concepta/rockets-core/zod` when starting from Zod schemas.
 */
export function defineOperationResource(
  definition: OperationResourceDefinition,
): OperationResource {
  const operations = definition.operations;
  if (Object.keys(operations).length === 0) {
    throw new Error(
      `defineOperationResource("${definition.path}"): at least one operation is required`,
    );
  }

  for (const [key, operation] of Object.entries(operations)) {
    if (operation.key !== key) {
      throw new Error(
        `defineOperationResource("${definition.path}"): operation key "${key}" does not match descriptor.key "${operation.key}"`,
      );
    }
  }

  const controller = buildOperationController(definition);
  const handlerProviders = collectHandlerProviders(operations);

  return {
    kind: ResourceKind.Operation,
    definition,
    controller,
    providers: [...(definition.providers ?? []), ...handlerProviders],
    imports: definition.imports,
    exports: definition.exports,
  };
}

export function isOperationResource(
  value: unknown,
): value is OperationResource {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    value.kind === ResourceKind.Operation
  );
}
