import type { Provider, Type } from '@nestjs/common';
import { Operation } from '@concepta/nestjs-core';
import {
  AccessControlQuery,
  type CanAccess,
} from '@concepta/nestjs-access-control';

import { ResourceKind } from '../../domain/interfaces/resource-kind.enum';
import type {
  OperationResource,
  OperationResourceDefinition,
} from '../../domain/interfaces/operation-resource.interface';
import { buildOperationController } from './operation-resource/build-operation-controller';
import { collectHandlerProviders } from './operation-resource/collect-handler-providers';
import { assertValidOperationKey } from './operation-resource/operation-key';
import { resolveOperationAcl } from './define-resource/build-acl';
import type { ResourceAclPlan } from '../../domain/interfaces/resource-acl.interface';
import type { OperationHttpMethod } from '../../domain/interfaces/operation-resource.interface';
import type { ResourceOperationName } from '../../domain/interfaces/rockets-resource-definition.interface';

/** HTTP methods an operation resource treats as reads. */
const READ_LIKE_METHODS: ReadonlySet<OperationHttpMethod> = new Set(['GET']);

/**
 * CRUD operation whose implied action matches this HTTP method. Only
 * consulted when the operation declares no explicit `acl`, which the
 * write path forbids — so in practice this maps `GET` → read and
 * `DELETE` → delete.
 */
function defaultOperationFor(
  method: OperationHttpMethod,
): ResourceOperationName | undefined {
  if (method === 'DELETE') return Operation.Delete;
  if (READ_LIKE_METHODS.has(method)) return Operation.Read;
  // A write has no inferable action. Returning `Operation.Read` as a
  // fallback would silently grant READ on a write if the fail-fast above
  // were ever loosened; `undefined` makes that a loud failure instead.
  return undefined;
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

  // Access control is resolved here, before the controller is built, so
  // the grant decorators can be stamped on the route methods and the
  // `CanAccess` classes can travel on the bundle for the planner to
  // register with `AccessControlModule`.
  const aclDecorators: Record<string, MethodDecorator[]> = {};
  const operationQueries: Type<CanAccess>[] = [];
  const ungrantedOperations: string[] = [];

  for (const [key, operation] of Object.entries(operations)) {
    // A non-CRUD write has no inferable action — `POST /pets/:id/transfer`
    // is an update, not a create — so `op.write` must say which.
    if (
      definition.acl !== undefined &&
      operation.acl === undefined &&
      !READ_LIKE_METHODS.has(operation.method) &&
      operation.method !== 'DELETE'
    ) {
      throw new Error(
        `defineOperationResource("${definition.path}"): operation "${key}" ` +
          `writes but declares no \`acl\` action. A write's HTTP verb does ` +
          `not imply a CRUD action — declare one, or \`acl: false\` to leave ` +
          `the route granted by nothing.`,
      );
    }

    // `Operation.Update` is a placeholder that is never read: the branch
    // above guarantees an explicit `acl` action whenever the method has
    // no inferable one AND access control is in play, and with no `acl`
    // anywhere `resolveOperationAcl` returns before touching it.
    const inferred = defaultOperationFor(operation.method) ?? Operation.Update;

    const isPublic = operation.public ?? definition.public ?? false;

    const binding = resolveOperationAcl({
      label: key,
      operation: inferred,
      resourceAcl: definition.acl,
      operationAcl: operation.acl,
      resourceKey: `operationResource("${definition.path}")`,
      isPublic,
    });

    const decorators: MethodDecorator[] = [];
    if (binding.grant) decorators.push(binding.grant);
    // Stamped per route, never at class level — see `OperationAclBinding`
    // for why a class-level default cannot be overridden by a method.
    if (binding.query) {
      operationQueries.push(binding.query);
      decorators.push(
        AccessControlQuery({ service: binding.query }) as MethodDecorator,
      );
    }
    if (decorators.length) aclDecorators[key] = decorators;

    if (!isPublic && definition.acl === undefined && operation.acl !== false) {
      ungrantedOperations.push(key);
    }
  }

  const acl: ResourceAclPlan = {
    // Only what a route actually carries — see `buildAclPlan`.
    queryServices: [...new Set(operationQueries)],
    ungrantedOperations,
    declared: definition.acl !== undefined,
    label: `operationResource("${definition.path}")`,
  };

  const explicitProviders: readonly Provider[] = definition.providers ?? [];
  const handlerProviders = collectHandlerProviders(
    operations,
    explicitProviders,
    definition.imports,
  );

  // Tokens this module registers itself. Anything else a handler
  // resolves to comes from an imported module, where a strict resolve
  // would not find it.
  const locallyProvided = new Set<unknown>([
    ...handlerProviders,
    ...explicitProviders.map((provider) =>
      typeof provider === 'function' ? provider : provider.provide,
    ),
  ]);

  const controller = buildOperationController(
    definition,
    locallyProvided,
    aclDecorators,
  );

  return {
    kind: ResourceKind.Operation,
    acl,
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
