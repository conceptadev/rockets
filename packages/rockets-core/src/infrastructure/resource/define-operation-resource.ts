import type { Provider, Type } from '@nestjs/common';

import { ResourceKind } from '../../domain/interfaces/resource-kind.enum';
import type {
  OperationHandler,
  OperationResource,
  OperationResourceDefinition,
} from '../../domain/interfaces/operation-resource.interface';
import { buildOperationController } from './operation-resource/build-operation-controller';
import { collectHandlerProviders } from './operation-resource/collect-handler-providers';
import { getHandlerClass } from './operation-resource/is-handler-class';
import { assertValidOperationKey } from './operation-resource/operation-key';

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
  const { operations } = definition;
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

  const explicitProviders: readonly Provider[] = definition.providers ?? [];
  const handlerProviders = collectHandlerProviders(
    operations,
    explicitProviders,
    definition.imports,
  );

  const locallyProvided = new Set<unknown>([
    ...handlerProviders,
    ...explicitProviders.map((provider) =>
      typeof provider === 'function' ? provider : provider.provide,
    ),
  ]);

  // A handler supplied by an imported module has no local provider, so a
  // strict `moduleRef` resolve cannot find it — and a NON-strict resolve
  // is not the answer: Nest's `instanceLinksHost` returns
  // `links[links.length - 1]` when no module id is given, i.e. the last
  // module scanned app-wide, unrelated to this module's imports. With the
  // same handler class exported by two modules, both operation resources
  // would silently share one instance.
  //
  // Registering a local ALIAS instead keeps resolution inside normal DI:
  // `useExisting` resolves the class through this module's injector
  // (imports honoured, no global scan), while the alias token itself is
  // local, so the route can resolve it strictly and unambiguously.
  const handlerAliases = new Map<Type<OperationHandler>, symbol>();
  const aliasProviders: Provider[] = [];
  for (const operation of Object.values(operations)) {
    const handlerClass = getHandlerClass(operation.handler);
    if (handlerClass === undefined) continue;
    if (locallyProvided.has(handlerClass)) continue;
    if (handlerAliases.has(handlerClass)) continue;

    const alias = Symbol(
      `RocketsOperationHandler(${handlerClass.name || 'anonymous'})`,
    );
    handlerAliases.set(handlerClass, alias);
    aliasProviders.push({ provide: alias, useExisting: handlerClass });
  }

  const controller = buildOperationController(definition, handlerAliases);

  return {
    kind: ResourceKind.Operation,
    definition,
    controller,
    providers: [...explicitProviders, ...handlerProviders, ...aliasProviders],
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
