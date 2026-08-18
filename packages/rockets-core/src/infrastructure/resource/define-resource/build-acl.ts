import type { Type } from '@nestjs/common';
import { ActionEnum, Operation } from '@concepta/nestjs-core';
import {
  AccessControlGrant,
  AccessControlQuery,
  type CanAccess,
} from '@concepta/nestjs-access-control';
import type {
  OperationAclConfig,
  ResourceAclAction,
  ResourceAclConfig,
  ResourceAclPlan,
} from '../../../domain/interfaces/resource-acl.interface';
import type { ResourceOperationName } from '../../../domain/interfaces/rockets-resource-definition.interface';
import type { InternalOperationOverride } from './internal-operation.types';

/**
 * Action each CRUD operation implies. `ReadMany` and `ReadOne` are the
 * same grant upstream (`AccessControlReadMany` and `AccessControlReadOne`
 * both emit `ActionEnum.READ`), so there is one row per action rather
 * than one per decorator.
 */
const OPERATION_ACTIONS: Readonly<
  Record<ResourceOperationName, ResourceAclAction>
> = {
  [Operation.List]: 'read',
  [Operation.Read]: 'read',
  [Operation.Create]: 'create',
  [Operation.Update]: 'update',
  [Operation.Replace]: 'update',
  [Operation.Delete]: 'delete',
  [Operation.SoftDelete]: 'delete',
  [Operation.Restore]: 'delete',
};

const ACTION_ENUM: Readonly<Record<ResourceAclAction, ActionEnum>> = {
  create: ActionEnum.CREATE,
  read: ActionEnum.READ,
  update: ActionEnum.UPDATE,
  delete: ActionEnum.DELETE,
};

export interface OperationAclBinding {
  /** Method decorator carrying the grant, or `undefined` when opted out. */
  readonly grant: MethodDecorator | undefined;
  /** Per-route `CanAccess` override, if the operation declared one. */
  readonly query: Type<CanAccess> | undefined;
}

/**
 * Resolves one operation's grant against the resource-level config.
 *
 * Throws rather than guessing whenever the two disagree: a grant that
 * silently disappears is an authenticated-but-unguarded route, which is
 * the failure this whole surface exists to remove.
 */
export function resolveOperationAcl(args: {
  readonly label: string;
  readonly operation: ResourceOperationName;
  readonly resourceAcl: ResourceAclConfig | undefined;
  readonly operationAcl: OperationAclConfig | undefined;
  readonly resourceKey: string;
}): OperationAclBinding {
  const { label, operation, resourceAcl, operationAcl, resourceKey } = args;

  if (operationAcl === false) {
    return { grant: undefined, query: undefined };
  }

  if (operationAcl !== undefined && resourceAcl === undefined) {
    throw new Error(
      `defineResource(${resourceKey}): \`operations.${label}.acl\` needs a ` +
        `resource-level \`acl: { resource }\` — an action has nothing to ` +
        `grant against on its own.`,
    );
  }

  if (resourceAcl === undefined) {
    return { grant: undefined, query: undefined };
  }

  const action =
    operationAcl === undefined
      ? OPERATION_ACTIONS[operation]
      : typeof operationAcl === 'string'
      ? operationAcl
      : operationAcl.action;

  const query =
    typeof operationAcl === 'object' && operationAcl !== null
      ? operationAcl.query
      : undefined;

  return {
    grant: AccessControlGrant({
      resource: resourceAcl.resource,
      action: ACTION_ENUM[action],
    }) as MethodDecorator,
    query,
  };
}

/**
 * Class-level decorators contributed by resource-level `acl`.
 * `AccessControlQuery` is what lets the upstream check-access handler
 * resolve the `CanAccess` service for `own` possession.
 */
export function buildAclControllerDecorators(
  resourceAcl: ResourceAclConfig | undefined,
): readonly ClassDecorator[] {
  if (!resourceAcl?.query) return [];
  return [AccessControlQuery({ service: resourceAcl.query }) as ClassDecorator];
}

/**
 * Everything the planner needs from one bundle: the `CanAccess` classes
 * to register, and the authenticated operations left without a grant.
 */
export function buildAclPlan(args: {
  readonly resourceKey: string;
  readonly isPublic: boolean;
  readonly resourceAcl: ResourceAclConfig | undefined;
  readonly operations: readonly ResourceOperationName[];
  readonly operationAcls: Readonly<
    Partial<Record<ResourceOperationName, OperationAclConfig>>
  >;
  readonly operationQueries: readonly Type<CanAccess>[];
}): ResourceAclPlan {
  const {
    resourceKey,
    isPublic,
    resourceAcl,
    operations,
    operationAcls,
    operationQueries,
  } = args;

  const queryServices = dedupe([
    ...(resourceAcl?.query ? [resourceAcl.query] : []),
    ...operationQueries,
  ]);

  // A public resource documents no bearer auth; deny-by-omission is about
  // routes an authenticated user reaches, so it does not apply there.
  const ungrantedOperations =
    isPublic || resourceAcl !== undefined
      ? []
      : operations.filter((op) => operationAcls[op] !== false);

  return {
    queryServices,
    ungrantedOperations,
    declared: resourceAcl !== undefined,
    label: resourceKey,
  };
}

function dedupe(services: readonly Type<CanAccess>[]): Type<CanAccess>[] {
  return [...new Set(services)];
}

/**
 * Appends the materialised access-control decorators to an operation
 * override without clobbering the ones the consumer declared.
 */
export function withAclDecorators(
  override: InternalOperationOverride | undefined,
  aclDecorators: readonly MethodDecorator[] | undefined,
): InternalOperationOverride | undefined {
  if (!aclDecorators?.length) return override;
  return {
    ...(override ?? {}),
    extraDecorators: [...(override?.extraDecorators ?? []), ...aclDecorators],
  };
}
