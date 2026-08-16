import { Operation } from '@concepta/nestjs-core';

import type { OperationHttpMethod } from '../../../domain/interfaces/operation-resource.interface';
import type { OperationResource } from '../../../domain/interfaces/operation-resource.interface';
import type { RocketsResourceConfig } from '../../../domain/interfaces/rockets-resource.interface';
import type { CrudResource } from '../../../domain/interfaces/rockets-resource-bundle.interface';

/**
 * Mirrors `@concepta/nestjs-crud` route defaults
 * (`CRUD_MODULE_ROUTE_*_DEFAULT_PATH`). Kept local because those constants
 * are not part of the package's public exports map.
 */
const CRUD_ID_PATH = ':id';
const CRUD_BULK_PATH = '/bulk';
const CRUD_RESTORE_PATH = '/restore/:id';

interface RouteClaim {
  readonly method: OperationHttpMethod;
  /** Canonical path for collision (`:id` and `:petId` both → `:param`). */
  readonly canonicalPath: string;
  /** Human-readable path as declared. */
  readonly displayPath: string;
  readonly source: string;
}

const CRUD_ROUTE_DEFAULTS: Record<
  Operation,
  { readonly method: OperationHttpMethod; readonly path: string }
> = {
  [Operation.List]: { method: 'GET', path: '' },
  [Operation.Create]: { method: 'POST', path: '' },
  [Operation.CreateBatch]: {
    method: 'POST',
    path: CRUD_BULK_PATH,
  },
  [Operation.Read]: { method: 'GET', path: CRUD_ID_PATH },
  [Operation.Update]: {
    method: 'PATCH',
    path: CRUD_ID_PATH,
  },
  [Operation.Replace]: {
    method: 'PUT',
    path: CRUD_ID_PATH,
  },
  [Operation.Delete]: {
    method: 'DELETE',
    path: CRUD_ID_PATH,
  },
  [Operation.SoftDelete]: {
    method: 'DELETE',
    path: CRUD_ID_PATH,
  },
  [Operation.Restore]: {
    method: 'PATCH',
    path: CRUD_RESTORE_PATH,
  },
};

function joinPath(base: string, segment: string): string {
  const b = base.replace(/^\/+|\/+$/g, '');
  const s = segment.replace(/^\/+/, '').replace(/\/+$/, '');
  if (s.length === 0) {
    return b;
  }
  if (b.length === 0) {
    return s;
  }
  return `${b}/${s}`;
}

function canonicalizePath(path: string): string {
  return path
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '')
    .replace(/:[A-Za-z_][A-Za-z0-9_]*/g, ':param');
}

function claimKey(method: OperationHttpMethod, canonicalPath: string): string {
  return `${method} /${canonicalPath}`;
}

function expandBases(path: string | string[] | undefined): string[] {
  if (path === undefined) {
    return [''];
  }
  return Array.isArray(path) ? path : [path];
}

function collectCrudConfigRoutes(
  config: RocketsResourceConfig,
  sourceLabel: string,
): RouteClaim[] {
  const crud = config.crud;
  if (!('operations' in crud) || !Array.isArray(crud.operations)) {
    // Class-only CRUD options — no structured ops to inspect.
    return [];
  }
  if (!('path' in crud.controller) || crud.controller.path === undefined) {
    return [];
  }

  const claims: RouteClaim[] = [];
  const bases = expandBases(crud.controller.path);

  for (const op of crud.operations) {
    const defaults = CRUD_ROUTE_DEFAULTS[op.operation];
    if (defaults === undefined) {
      continue;
    }
    const segments = expandBases(op.path ?? defaults.path);
    for (const base of bases) {
      for (const segment of segments) {
        const displayPath = joinPath(String(base), String(segment));
        claims.push({
          method: defaults.method,
          canonicalPath: canonicalizePath(displayPath),
          displayPath,
          source: `${sourceLabel} (${op.operation})`,
        });
      }
    }
  }

  return claims;
}

function collectOperationRoutes(bundle: OperationResource): RouteClaim[] {
  const claims: RouteClaim[] = [];
  const base = bundle.definition.path;
  for (const operation of Object.values(bundle.definition.operations)) {
    const displayPath = joinPath(base, operation.path);
    claims.push({
      method: operation.method,
      canonicalPath: canonicalizePath(displayPath),
      displayPath,
      source: `operationResource("${base}").${operation.key}`,
    });
  }
  return claims;
}

/**
 * Fail-fast: reject METHOD + path collisions across CRUD/Sub and
 * operation resources at plan time (before Nest last-wins).
 *
 * Param names are canonicalized (`:id` ≡ `:petId`) because Nest matches
 * them as the same pattern. Module-resource hand controllers are out of
 * scope (no structured path on the plan).
 */
export function validateRouteCollisions(args: {
  readonly generatedResources: ReadonlyArray<CrudResource>;
  readonly manualResources: ReadonlyArray<RocketsResourceConfig>;
  readonly operationBundles: ReadonlyArray<OperationResource>;
}): void {
  const claims: RouteClaim[] = [];

  for (const resource of args.generatedResources) {
    claims.push(
      ...collectCrudConfigRoutes(
        resource.core,
        `defineResource(${resource.meta.key})`,
      ),
    );
  }

  for (const [index, config] of args.manualResources.entries()) {
    claims.push(
      ...collectCrudConfigRoutes(config, `manualResources[${index}]`),
    );
  }

  for (const bundle of args.operationBundles) {
    claims.push(...collectOperationRoutes(bundle));
  }

  const seen = new Map<string, RouteClaim>();
  for (const claim of claims) {
    const key = claimKey(claim.method, claim.canonicalPath);
    const prior = seen.get(key);
    if (prior !== undefined) {
      throw new Error(
        `buildAppRegistrationPlan: duplicate route ${claim.method} ` +
          `"/${claim.displayPath}" claimed by ${claim.source} and ` +
          `${prior.source} (canonical "/${claim.canonicalPath}")`,
      );
    }
    seen.set(key, claim);
  }
}
