import type { Provider, Type } from '@nestjs/common';

import { ResourceKind } from '../../domain/interfaces/resource-kind.enum';
import type {
  CompiledOperationDescriptor,
  OperationHandler,
  OperationResource,
  OperationResourceDefinition,
} from '../../domain/interfaces/operation-resource.interface';
import { buildOperationController } from './operation-resource/build-operation-controller';
import { getHandlerClass } from './operation-resource/is-handler-class';
import { assertValidOperationKey } from './operation-resource/operation-key';

function providerToken(provider: Provider): unknown {
  if (typeof provider === 'function') {
    return provider;
  }
  if (
    typeof provider === 'object' &&
    provider !== null &&
    'provide' in provider
  ) {
    return provider.provide;
  }
  return undefined;
}

function collectHandlerProviders(
  operations: Readonly<Record<string, CompiledOperationDescriptor>>,
  explicitProviders: ReadonlyArray<Provider>,
): Provider[] {
  const providers: Provider[] = [];
  const explicitTokens = new Set(explicitProviders.map(providerToken));
  const seen = new Set<Type<OperationHandler>>();
  for (const operation of Object.values(operations)) {
    const handlerClass = getHandlerClass(operation.handler);
    if (handlerClass === undefined) {
      continue;
    }
    if (explicitTokens.has(handlerClass) || seen.has(handlerClass)) {
      continue;
    }
    seen.add(handlerClass);
    providers.push(handlerClass);
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
 * Prefer the zod helper `operationResource` (`read` / `write` / `delete`
 * builders) from `@concepta/rockets-core/zod` when starting from Zod schemas.
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
    assertValidOperationKey(key, definition.path);
    if (operation.key !== key) {
      throw new Error(
        `defineOperationResource("${definition.path}"): operation key "${key}" does not match descriptor.key "${operation.key}"`,
      );
    }
    const hasOutput = operation.outputDto !== undefined;
    const optedOut = operation.outputDisabled === true;
    if (!hasOutput && !optedOut) {
      throw new Error(
        `defineOperationResource("${definition.path}"): operation "${key}" ` +
          `must declare outputDto or outputDisabled: true — omitting both ` +
          `allows response leakage`,
      );
    }
    if (hasOutput && optedOut) {
      throw new Error(
        `defineOperationResource("${definition.path}"): operation "${key}" ` +
          `cannot set both outputDto and outputDisabled`,
      );
    }
    if (operation.status === 204 && hasOutput) {
      throw new Error(
        `defineOperationResource("${definition.path}"): operation "${key}" ` +
          `sets status 204 with outputDto — 204 responses have no body`,
      );
    }
  }

  const controller = buildOperationController(definition);
  const explicitProviders = definition.providers ?? [];
  const handlerProviders = collectHandlerProviders(
    operations,
    explicitProviders,
  );

  return {
    kind: ResourceKind.Operation,
    definition,
    controller,
    providers: [...explicitProviders, ...handlerProviders],
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
