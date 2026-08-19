import type {
  RouteAuditEntry,
  RouteAuditReport,
  RoutePolicy,
  RoutePolicyViolation,
} from './route-audit.types';

/**
 * Checks every discovered route against the declared policy.
 *
 * Returns ALL violations rather than throwing on the first: an audit
 * that reveals one problem per boot turns a five-minute fix into five
 * boots, and the whole point is to make the full picture visible at
 * once.
 */
export function evaluateRoutePolicy(
  report: RouteAuditReport,
  policy: RoutePolicy,
): readonly RoutePolicyViolation[] {
  const allowedIds = new Set(policy.allow ?? []);
  const allowedControllers = new Set(
    (policy.allowControllers ?? []).map((controller) => controller.name),
  );
  const violations: RoutePolicyViolation[] = [];

  // An unguarded app is reported ONCE, before any per-route rule runs,
  // and short-circuits the rest.
  //
  // Both halves matter. Without the short-circuit, `requireAuth` repeats
  // the same app-wide cause on every route and buries it. Without the
  // check running for EVERY rule, `requireAcl` and `requireAclQuery` go
  // silent instead: they gate on `authentication === 'guarded'`, and on
  // an unguarded app no route is, so declaring `requireAcl` alone would
  // boot clean with nothing enforced — this module committing the exact
  // failure it exists to catch.
  const declaredRules = ruleNames(policy);
  if (declaredRules.length > 0 && report.globalGuards.length === 0) {
    return [
      {
        routeId: '*',
        rule: declaredRules[0],
        detail:
          'the application registers no global guard, so nothing authenticates ' +
          `any route and ${declaredRules.join(', ')} cannot be satisfied. ` +
          'Compose `@concepta/rockets` (which registers one unless ' +
          '`enableGlobalGuard: false`), or provide APP_GUARD yourself.',
      },
    ];
  }

  for (const route of report.routes) {
    if (allowedIds.has(route.id) || allowedControllers.has(route.controller)) {
      continue;
    }

    if (policy.requireAuth === true) {
      violations.push(...authViolations(route));
    }

    // ACL is only meaningful where a caller identity exists, so a route
    // the author deliberately opened is not also asked to authorise.
    // `unguarded-app` is NOT treated as deliberate — it is the app-wide
    // failure `requireAuth` already reports, and repeating it per route
    // as a missing grant would bury the real cause.
    const authenticated = route.authentication === 'guarded';

    if (policy.requireAcl === true && authenticated && !route.aclAction) {
      violations.push({
        routeId: route.id,
        rule: 'requireAcl',
        detail:
          `${route.controller}.${route.handler} carries no AccessControlGrant. ` +
          'Upstream returns true for a route with no grant metadata, so this ' +
          'route is authenticated but open. Declare `acl` on the resource, or ' +
          `add "${route.id}" to \`allow\` to record it as deliberate.`,
      });
    }

    if (
      policy.requireAclQuery === true &&
      authenticated &&
      route.aclAction !== null &&
      route.aclQuery === null
    ) {
      violations.push({
        routeId: route.id,
        rule: 'requireAclQuery',
        detail:
          `${route.controller}.${route.handler} grants "${route.aclAction}" but names ` +
          'no CanAccess service, so `own` possession cannot be resolved and the ' +
          'grant widens to every row.',
      });
    }
  }

  return violations;
}

/** Which rules the app actually declared, in reporting order. */
function ruleNames(policy: RoutePolicy): RoutePolicyViolation['rule'][] {
  const names: RoutePolicyViolation['rule'][] = [];
  if (policy.requireAuth === true) names.push('requireAuth');
  if (policy.requireAcl === true) names.push('requireAcl');
  if (policy.requireAclQuery === true) names.push('requireAclQuery');
  return names;
}

/**
 * Per-route auth check. The unguarded-app case never reaches here — it
 * is reported once, app-wide, by `evaluateRoutePolicy`.
 */
function authViolations(route: RouteAuditEntry): RoutePolicyViolation[] {
  if (
    route.authentication === 'public' ||
    route.authentication === 'public-class'
  ) {
    return [
      {
        routeId: route.id,
        rule: 'requireAuth',
        detail:
          `${route.controller}.${route.handler} is AuthPublic` +
          `${
            route.authentication === 'public-class' ? ' at class level' : ''
          }. ` +
          `Add "${route.id}" to \`allow\` if that is intended.`,
      },
    ];
  }

  return [];
}

/** Renders violations as the boot error message. */
export function formatPolicyViolations(
  violations: readonly RoutePolicyViolation[],
): string {
  const lines = violations.map(
    (v) => `  - [${v.rule}] ${v.routeId}: ${v.detail}`,
  );
  return (
    `Rockets route policy rejected ${violations.length} route` +
    `${violations.length === 1 ? '' : 's'}:\n${lines.join('\n')}`
  );
}
