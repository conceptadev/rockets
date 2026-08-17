import { Operation } from '@concepta/nestjs-core';

import type { OperationHttpMethod } from '../../../domain/interfaces/operation-resource.interface';
import type { OperationResource } from '../../../domain/interfaces/operation-resource.interface';
import type { RocketsResourceConfig } from '../../../domain/interfaces/rockets-resource.interface';
import type { CrudResource } from '../../../domain/interfaces/rockets-resource-bundle.interface';
import {
  parseStructuredRoutePattern,
  structuredRoutePatternsMayOverlap,
  type StructuredRoutePattern,
} from './route-pattern';

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
  /** Human-readable path as declared. */
  readonly displayPath: string;
  readonly pattern: StructuredRoutePattern;
  readonly host?: string | RegExp | Array<string | RegExp>;
  readonly version?: unknown;
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
  const b = trimPathSlashes(base);
  const s = trimPathSlashes(segment);
  if (s.length === 0) {
    return b;
  }
  if (b.length === 0) {
    return s;
  }
  return `${b}/${s}`;
}

function trimPathSlashes(path: string): string {
  return path
    .split('/')
    .filter((part) => part.length > 0)
    .join('/');
}

function normalizeDimension(value: unknown): string {
  if (value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map(normalizeDimension).sort().join(',');
  }
  return String(value);
}

function dimensionsMayOverlap(a: unknown, b: unknown): boolean {
  if (a === undefined || b === undefined) {
    return true;
  }
  const left = new Set(
    Array.isArray(a) ? a.map(normalizeDimension) : [normalizeDimension(a)],
  );
  const right = Array.isArray(b)
    ? b.map(normalizeDimension)
    : [normalizeDimension(b)];
  return right.some((value) => left.has(value));
}

function claimsMayOverlap(a: RouteClaim, b: RouteClaim): boolean {
  if (a.method !== b.method) {
    return false;
  }
  if (!dimensionsMayOverlap(a.host, b.host)) {
    return false;
  }
  if (!dimensionsMayOverlap(a.version, b.version)) {
    return false;
  }
  return structuredRoutePatternsMayOverlap(a.pattern, b.pattern) === true;
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
          displayPath,
          pattern: parseStructuredRoutePattern(displayPath),
          host: crud.controller.host,
          version: crud.controller.version,
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
      displayPath,
      pattern: parseStructuredRoutePattern(displayPath),
      host: undefined,
      version: undefined,
      source: `operationResource("${base}").${operation.key}`,
    });
  }
  return claims;
}

/**
 * Fail-fast: reject structured route collisions across Rockets-owned CRUD/Sub
 * and operation resources at plan time (before Nest last-wins).
 *
 * This is intentionally not a universal app-route audit. It only sees routes
 * represented in `resources[]`; global prefix, Nest versioning strategy, and
 * hand-written controllers belong to the post-boot registered-route validator.
 */
export function validateStructuredRouteCollisions(args: {
  readonly generatedResources: ReadonlyArray<CrudResource>;
  readonly manualResources: ReadonlyArray<RocketsResourceConfig>;
  readonly operationBundles: ReadonlyArray<OperationResource>;
}): void {
  if (args.operationBundles.length === 0) {
    return;
  }

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

  for (const [index, claim] of claims.entries()) {
    for (const prior of claims.slice(0, index)) {
      if (!claimsMayOverlap(claim, prior)) {
        continue;
      }
      throw new Error(
        `buildAppRegistrationPlan: duplicate route ${claim.method} ` +
          `"/${claim.displayPath}" claimed by ${claim.source} and ` +
          `${prior.source}`,
      );
    }
  }
}

export const validateRouteCollisions = validateStructuredRouteCollisions;
