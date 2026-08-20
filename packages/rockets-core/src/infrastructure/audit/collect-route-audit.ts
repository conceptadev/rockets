import { RequestMethod, type Type } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import {
  ACL_GRANT_METADATA_KEY,
  ACL_QUERY_METADATA_KEY,
} from './acl-metadata-keys';
import { ROCKETS_DISABLE_GUARDS_TOKEN } from '../../rockets-core.constants';
import type {
  RouteAuditEntry,
  RouteAuthState,
  RouteAuditReport,
} from './route-audit.types';

/** One discovered controller class plus the methods to inspect. */
export interface ControllerScan {
  readonly controller: Type<unknown>;
  readonly methodNames: readonly string[];
}

const METHOD_NAMES: Readonly<Record<number, string>> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.POST]: 'POST',
  [RequestMethod.PUT]: 'PUT',
  [RequestMethod.DELETE]: 'DELETE',
  [RequestMethod.PATCH]: 'PATCH',
  [RequestMethod.ALL]: 'ALL',
  [RequestMethod.OPTIONS]: 'OPTIONS',
  [RequestMethod.HEAD]: 'HEAD',
  [RequestMethod.SEARCH]: 'SEARCH',
};

/**
 * Builds the route report from already-discovered controllers.
 *
 * Pure on purpose: the Nest-facing service supplies the controller list
 * and the global guard names, so every judgement this makes is testable
 * without booting an application.
 *
 * The authentication state mirrors `AuthServerGuard` exactly — same
 * metadata key, same `true | 'classLevel'` sentinel handling. A report
 * that decided "public" by its own rules would be a second source of
 * truth, and the point of this audit is that there is only one.
 */
export function collectRouteAudit(args: {
  readonly controllers: readonly ControllerScan[];
  readonly globalGuards: readonly string[];
}): RouteAuditReport {
  const appIsUnguarded = args.globalGuards.length === 0;
  const routes: RouteAuditEntry[] = [];

  for (const { controller, methodNames } of args.controllers) {
    const basePath = readPath(controller);
    const classPublic = readPublic(controller);

    for (const methodName of methodNames) {
      const handler = readHandler(controller, methodName);
      if (handler === undefined) continue;

      const httpMethod = readHttpMethod(handler);
      if (httpMethod === undefined) continue;

      const path = joinPath(basePath, readPath(handler));
      const method = METHOD_NAMES[httpMethod] ?? String(httpMethod);

      routes.push({
        id: `${method} /${path}`,
        method,
        path: `/${path}`,
        controller: controller.name,
        handler: methodName,
        authentication: resolveAuth(
          readPublic(handler),
          classPublic,
          appIsUnguarded,
        ),
        aclAction: readGrantField(handler, 'action'),
        aclResource: readGrantField(handler, 'resource'),
        aclQuery: readQueryService(handler),
      });
    }
  }

  return { routes, globalGuards: args.globalGuards };
}

/**
 * An app with no global guard cannot authenticate anything, so no route
 * is reported `guarded` — an explicit `AuthPublic` still reads as the
 * author's intent and is preserved.
 */
function resolveAuth(
  handlerPublic: unknown,
  classPublic: unknown,
  appIsUnguarded: boolean,
): RouteAuthState {
  if (isPublic(handlerPublic)) return 'public';
  if (isPublic(classPublic)) return 'public-class';
  return appIsUnguarded ? 'unguarded-app' : 'guarded';
}

/**
 * Upstream `AuthPublic({ classLevel: true })` stores the sentinel string
 * rather than `true`, so its own guard can tell a deliberate class-wide
 * choice from an accidental one. Both disable the guard.
 */
function isPublic(value: unknown): boolean {
  return value === true || value === 'classLevel';
}

function readPublic(target: object): unknown {
  return Reflect.getMetadata(ROCKETS_DISABLE_GUARDS_TOKEN, target);
}

function readHandler(
  controller: Type<unknown>,
  methodName: string,
): ((...args: unknown[]) => unknown) | undefined {
  const prototype: unknown = controller.prototype;
  if (typeof prototype !== 'object' || prototype === null) return undefined;
  const handler: unknown = Reflect.get(prototype, methodName);
  return typeof handler === 'function'
    ? (handler as (...args: unknown[]) => unknown)
    : undefined;
}

function readHttpMethod(handler: object): number | undefined {
  const value: unknown = Reflect.getMetadata(METHOD_METADATA, handler);
  return typeof value === 'number' ? value : undefined;
}

function readPath(target: object): string {
  const value: unknown = Reflect.getMetadata(PATH_METADATA, target);
  // A controller or handler declared with an array of paths registers
  // several routes; the first is reported so one entry stays one id.
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' ? trimSlashes(raw) : '';
}

/**
 * Reads one field from the grant metadata.
 *
 * Upstream stores an array — a handler can carry several grants — and
 * the shapes differ per decorator (`AccessControlCreateOne` and friends
 * each build their own). Only fields that are actually present are
 * reported; anything else stays `null` rather than being invented.
 */
function readGrantField(handler: object, field: string): string | null {
  if (ACL_GRANT_METADATA_KEY === undefined) return null;
  const value: unknown = Reflect.getMetadata(ACL_GRANT_METADATA_KEY, handler);
  const grants = Array.isArray(value)
    ? value
    : value === undefined
    ? []
    : [value];

  for (const grant of grants) {
    if (typeof grant !== 'object' || grant === null) continue;
    const field_ = Reflect.get(grant, field);
    if (typeof field_ === 'string') return field_;
  }
  return null;
}

function readQueryService(handler: object): string | null {
  if (ACL_QUERY_METADATA_KEY === undefined) return null;
  const value: unknown = Reflect.getMetadata(ACL_QUERY_METADATA_KEY, handler);
  const entries = Array.isArray(value)
    ? value
    : value === undefined
    ? []
    : [value];

  for (const entry of entries) {
    if (typeof entry !== 'object' || entry === null) continue;
    const service: unknown = Reflect.get(entry, 'service');
    if (typeof service === 'function' && typeof service.name === 'string') {
      return service.name;
    }
  }
  return null;
}

function joinPath(base: string, segment: string): string {
  if (!segment) return base;
  if (!base) return segment;
  return `${base}/${segment}`;
}

function trimSlashes(path: string): string {
  return path
    .split('/')
    .filter((part) => part.length > 0)
    .join('/');
}
