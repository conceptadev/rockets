import type { Type } from '@nestjs/common';

/** How a route's authentication resolves, as the guard itself decides it. */
export type RouteAuthState =
  /** No opt-out metadata: the global guard applies. */
  | 'guarded'
  /** `AuthPublic()` on the handler. */
  | 'public'
  /** `AuthPublic({ classLevel: true })` on the controller. */
  | 'public-class'
  /**
   * The app registered no global guard, so nothing authenticates this
   * route whatever its metadata says. Reported separately because the
   * failure is app-wide and a per-route `guarded` would be a lie.
   */
  | 'unguarded-app';

/** One discovered HTTP route and what is actually enforced on it. */
export interface RouteAuditEntry {
  /** `GET /users/:id` — stable id used by `allow` entries. */
  readonly id: string;
  readonly method: string;
  /**
   * Controller path joined with the handler path.
   *
   * Global prefix and Nest versioning are NOT applied: they are resolved
   * by the HTTP adapter after this runs. The id is therefore stable
   * against those settings rather than accurate to the wire path.
   */
  readonly path: string;
  readonly controller: string;
  readonly handler: string;
  readonly authentication: RouteAuthState;
  /** Action granted by `AccessControlGrant`, or `null` when ungranted. */
  readonly aclAction: string | null;
  /** Resource named by the grant, when the grant declares one. */
  readonly aclResource: string | null;
  /** `CanAccess` service name resolving `own` possession, or `null`. */
  readonly aclQuery: string | null;
}

export interface RouteAuditReport {
  readonly routes: readonly RouteAuditEntry[];
  /** Whether any global guard is registered at all. */
  readonly globalGuards: readonly string[];
}

/** A single way a route failed the declared policy. */
export interface RoutePolicyViolation {
  readonly routeId: string;
  readonly rule: 'requireAuth' | 'requireAcl' | 'requireAclQuery';
  readonly detail: string;
}

/**
 * What the application asserts about EVERY discovered route.
 *
 * Each rule is off by default: turning one on is a statement that the
 * app has finished that work, and the boot failure is what keeps it
 * finished.
 */
export interface RoutePolicy {
  /** Every route must be reached through a guard. */
  readonly requireAuth?: boolean;
  /** Every authenticated route must carry an `AccessControlGrant`. */
  readonly requireAcl?: boolean;
  /** Every granted route must also name a `CanAccess` query service. */
  readonly requireAclQuery?: boolean;
  /**
   * Route ids exempt from every rule, e.g. `['GET /health']`.
   *
   * Deliberately an explicit id list rather than a pattern: an exemption
   * that silently widens as routes are added is the failure this whole
   * audit exists to remove.
   */
  readonly allow?: readonly string[];
  /**
   * Controllers exempt from every rule, by class.
   *
   * For controllers a consumer does not own — a package's own
   * `MeController`, a health controller from a third party — where
   * listing every route id would drift as that package changes.
   */
  readonly allowControllers?: readonly Type<unknown>[];
}
