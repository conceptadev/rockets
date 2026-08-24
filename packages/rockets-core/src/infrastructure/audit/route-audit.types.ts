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
  /**
   * The controller class itself, for identity-based exemption matching.
   * `JSON.stringify` omits function-valued keys, so a serialised report
   * simply has no `controllerRef` — match on `controller` + `id` in a
   * CI artifact; identity matters only in-process.
   */
  readonly controllerRef: Type<unknown>;
  readonly handler: string;
  readonly authentication: RouteAuthState;
  /**
   * Whether `@AuthSession()` marks this route session-cookie
   * authenticated (issue #58's ternary `public | internal | session`
   * policy) — `false` for an "internal" bearer-style route. Orthogonal
   * to `authentication`: a session route is still `guarded` (the normal
   * adapter chain authenticates it); this only reports whether `CsrfGuard`
   * additionally applies to it. `@AuthPublic` and `@AuthSession` on the
   * SAME handler is a contradiction — a public route has no session to
   * protect — and `collectRouteAudit` throws rather than resolve it for
   * you, the same rule `public` + a grant follows in `acl` (#51).
   */
  readonly sessionAuth: boolean;
  /** Action granted by `AccessControlGrant`, or `null` when ungranted. */
  readonly aclAction: string | null;
  /** Resource named by the grant, when the grant declares one. */
  readonly aclResource: string | null;
  /**
   * `CanAccess` service name resolving `own` possession, or `null`.
   * Reports the NEAREST declaration (handler over class); upstream runs
   * every declared service, so a route carrying both is enforced by
   * both while this names one.
   */
  readonly aclQuery: string | null;
}

export interface RouteAuditReport {
  readonly routes: readonly RouteAuditEntry[];
  /** Every resolved global guard (application and request scoped). */
  readonly globalGuards: readonly string[];
  /**
   * The subset recognised as AUTHENTICATION guards — `AuthServerGuard`
   * plus anything listed in `RoutePolicy.authGuards`. This, not
   * `globalGuards`, is what decides `guarded`: an app whose only global
   * guard is a throttler or a disabled ACL factory authenticates
   * nothing.
   */
  readonly authGuards: readonly string[];
}

/** A single way a route failed the declared policy. */
export interface RoutePolicyViolation {
  readonly routeId: string;
  readonly rule:
    | 'requireAuth'
    | 'requireAcl'
    | 'requireAclQuery'
    | 'staleAllow';
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
   * Route ids exempt from EVERY declared rule, e.g. `['GET /health']`.
   *
   * Deliberately an explicit id list rather than a pattern: an exemption
   * that silently widens as routes are added is the failure this whole
   * audit exists to remove. Two limits to know: an entry exempts the
   * route from all rules, not the one it was added for; and, while at
   * least one rule is declared, an entry matching NO discovered route
   * fails the boot as `staleAllow`, so the list cannot rot where it
   * matters. A recognition-only policy polices nothing, staleness
   * included.
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
  /**
   * Guard classes recognised as AUTHENTICATION guards, besides
   * `AuthServerGuard`. Compose-your-own-auth apps (an integration-owned
   * JWT guard, for instance) list theirs here; without it the audit
   * reports the app unguarded, because it refuses to assume that any
   * global guard authenticates. Matched by class identity against
   * resolved instances (`instanceof`) and request-scoped wrappers.
   */
  readonly authGuards?: readonly Type<unknown>[];
}
