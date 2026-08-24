import { describe, expect, it } from 'vitest';
import { Controller } from '@nestjs/common';

import { collectRouteAudit } from './collect-route-audit';
import { evaluateRoutePolicy } from './evaluate-route-policy';
import type { RouteAuditReport } from './route-audit.types';

class ProbeController {}

function report(overrides: Partial<RouteAuditReport>): RouteAuditReport {
  return {
    routes: [
      {
        id: 'GET /things',
        method: 'GET',
        path: '/things',
        controller: 'ProbeController',
        controllerRef: ProbeController,
        handler: 'list',
        authentication: 'guarded',
        sessionAuth: false,
        aclAction: null,
        aclResource: null,
        aclQuery: null,
      },
    ],
    globalGuards: ['SomeAuthGuard'],
    authGuards: ['SomeAuthGuard'],
    ...overrides,
  };
}

describe('evaluateRoutePolicy — the staleAllow gate', () => {
  it('flags a stale allow entry while a rule is declared', () => {
    const violations = evaluateRoutePolicy(report({}), {
      requireAcl: true,
      allow: ['GET /things', 'GET /gone'],
    });
    expect(violations).toEqual([
      expect.objectContaining({ rule: 'staleAllow', routeId: 'GET /gone' }),
    ]);
  });

  // The branch whose whole justification is "the audit must not be the
  // incident": a recognition-only policy enforces nothing, so it must
  // not abort a boot over list hygiene either. Reverting the
  // `declaredRules.length > 0` gate is what this pins.
  it('does NOT flag stale entries when no rule is declared', () => {
    const violations = evaluateRoutePolicy(report({}), {
      allow: ['GET /gone-and-irrelevant'],
    });
    expect(violations).toEqual([]);
  });
});

describe('collectRouteAudit — path arrays', () => {
  it('reports one row per controller-path x handler-path combination', () => {
    // Real decorator metadata, not hand-written keys: the collector must
    // read what Nest actually stamps for `@Controller(['a', 'b'])`.
    @Controller(['alpha', 'beta'])
    class MultiPathController {
      list(): void {}
    }
    Reflect.defineMetadata(
      'path',
      ['x', 'y'],
      MultiPathController.prototype.list,
    );
    Reflect.defineMetadata('method', 0, MultiPathController.prototype.list);

    const { routes } = collectRouteAudit({
      controllers: [{ controller: MultiPathController, methodNames: ['list'] }],
      globalGuards: [],
      authGuards: [],
    });

    expect(routes.map((route) => route.id).sort()).toEqual([
      'GET /alpha/x',
      'GET /alpha/y',
      'GET /beta/x',
      'GET /beta/y',
    ]);
  });
});
