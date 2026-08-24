import { RequestMethod, type Type } from '@nestjs/common';
import {
  HOST_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
  VERSION_METADATA,
} from '@nestjs/common/constants';

import { ROCKETS_DISABLE_GUARDS_TOKEN } from '../../rockets-core.constants';
import { ROCKETS_AUTH_SESSION_TOKEN } from '../../decorators/auth-session.decorator';
import { aclMetadataKeys } from './acl-metadata-keys';
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
 * and the guard summary, so every judgement this makes is testable
 * without booting an application.
 *
 * The authentication state mirrors `AuthServerGuard` exactly — same
 * metadata key, same `true | 'classLevel'` sentinel handling. A report
 * that decided "public" by its own rules would be a second source of
 * truth, and the point of this audit is that there is only one.
 *
 * `authGuardPresent` — not "some global guard exists" — is what decides
 * `guarded`. A `ThrottlerGuard`, an ACL guard, or upstream
 * access-control's disabled-guard factory (which registers `APP_GUARD`
 * unconditionally and resolves to `null` when `appGuard: false`) do not
 * authenticate anything, and counting them once reported an app with
 * ZERO authentication as fully guarded.
 */
export function collectRouteAudit(args: {
  readonly controllers: readonly ControllerScan[];
  /** Every resolved global guard, for the report. */
  readonly globalGuards: readonly string[];
  /** Names of the guards recognised as AUTHENTICATION guards. */
  readonly authGuards: readonly string[];
}): RouteAuditReport {
  const appIsUnguarded = args.authGuards.length === 0;
  const routes: RouteAuditEntry[] = [];

  for (const { controller, methodNames } of args.controllers) {
    const basePaths = readPaths(controller);
    const classPublic = readPublic(controller);

    for (const methodName of methodNames) {
      const handler = readHandler(controller, methodName);
      if (handler === undefined) continue;

      const httpMethod = readHttpMethod(handler);
      if (httpMethod === undefined) continue;

      const method = METHOD_NAMES[httpMethod] ?? String(httpMethod);
      const authentication = resolveAuth(
        readPublic(handler),
        classPublic,
        appIsUnguarded,
      );
      const sessionAuth = isSession(
        readSession(handler),
        readSession(controller),
      );
      if (
        sessionAuth &&
        (authentication === 'public' || authentication === 'public-class')
      ) {
        throw new Error(
          `${controller.name}.${methodName}: declares both @AuthPublic ` +
            `and @AuthSession — a public route has no session to protect. ` +
            `Pick one.`,
        );
      }

      // A controller or handler declared with an ARRAY of paths
      // registers one wire route per combination; the report carries
      // one row per combination too, or the table understates the
      // surface it exists to describe.
      // Version and host are REAL routing dimensions: a public v1 and a
      // guarded v2 of the same METHOD+path are different wire routes,
      // and collapsing them to one id let a single `allow` entry exempt
      // BOTH — the silently-widening exemption the docs forbid (review
      // round 4). The qualifier is part of the identity whenever the
      // dimension is declared.
      const version = readVersion(handler) ?? readVersion(controller);
      const host = readHost(controller);
      const qualifier =
        (version !== undefined ? ` [v${version}]` : '') +
        (host !== undefined ? ` [host:${host}]` : '');

      for (const base of basePaths) {
        for (const segment of readPaths(handler)) {
          const path = joinPath(base, segment);
          routes.push({
            id: `${method} /${path}${qualifier}`,
            method,
            path: `/${path}`,
            controller: controller.name,
            controllerRef: controller,
            handler: methodName,
            authentication,
            sessionAuth,
            // Grants mirror enforcement exactly: upstream reads them
            // with `reflector.get(..., getHandler())` — handler ONLY.
            aclAction: readGrantField(handler, 'action'),
            aclResource: readGrantField(handler, 'resource'),
            // Queries do NOT: upstream merges `[class, handler]`
            // (`check-access.handler.js:68`), so a class-level
            // AccessControlQuery is enforced at runtime — auditing only
            // the handler reported it null and `requireAclQuery`
            // aborted the boot of a correctly-enforced app.
            aclQuery: readQueryService(handler) ?? readQueryService(controller),
          });
        }
      }
    }
  }

  return {
    routes,
    globalGuards: args.globalGuards,
    authGuards: args.authGuards,
  };
}

/**
 * An app with no AUTHENTICATION guard cannot authenticate anything, so
 * no route is reported `guarded` — an explicit `AuthPublic` still reads
 * as the author's intent and is preserved.
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

function readSession(target: object): unknown {
  return Reflect.getMetadata(ROCKETS_AUTH_SESSION_TOKEN, target);
}

/** Same `true | 'classLevel'` sentinel shape as `isPublic`. */
function isSession(handlerValue: unknown, classValue: unknown): boolean {
  return (
    handlerValue === true ||
    handlerValue === 'classLevel' ||
    classValue === true ||
    classValue === 'classLevel'
  );
}

/** Declared Nest version(s), joined deterministically; undefined when none. */
function readVersion(target: object): string | undefined {
  const value: unknown = Reflect.getMetadata(VERSION_METADATA, target);
  if (value === undefined) return undefined;
  const list = Array.isArray(value) ? value : [value];
  const parts = list.map((entry) =>
    typeof entry === 'symbol' ? 'neutral' : String(entry),
  );
  return parts.length > 0 ? parts.sort().join(',') : undefined;
}

function readHost(target: object): string | undefined {
  const value: unknown = Reflect.getMetadata(HOST_METADATA, target);
  if (value === undefined) return undefined;
  const list = Array.isArray(value) ? value : [value];
  return list.map(String).sort().join(',') || undefined;
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

/** All declared paths — a string, an array of strings, or none. */
function readPaths(target: object): string[] {
  const value: unknown = Reflect.getMetadata(PATH_METADATA, target);
  const raw = Array.isArray(value) ? value : [value];
  const paths = raw
    .filter((entry): entry is string => typeof entry === 'string')
    .map(trimSlashes);
  return paths.length > 0 ? paths : [''];
}

/**
 * Reads one field from the grant metadata.
 *
 * Upstream stores an array — a handler can carry several grants — and
 * the shapes differ per decorator. Only fields actually present are
 * reported; anything else stays `null` rather than being invented.
 */
function readGrantField(handler: object, field: string): string | null {
  const value: unknown = Reflect.getMetadata(aclMetadataKeys().grant, handler);
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
  const value: unknown = Reflect.getMetadata(aclMetadataKeys().query, handler);
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
