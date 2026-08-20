import { Inject, Injectable, Optional, type Type } from '@nestjs/common';
import { APP_GUARD, DiscoveryService, MetadataScanner } from '@nestjs/core';

import { collectRouteAudit, type ControllerScan } from './collect-route-audit';
import {
  evaluateRoutePolicy,
  formatPolicyViolations,
} from './evaluate-route-policy';
import type { RouteAuditReport, RoutePolicy } from './route-audit.types';

export const ROCKETS_ROUTE_POLICY_TOKEN = Symbol('ROCKETS_ROUTE_POLICY');

/**
 * Reports what is actually enforced on every discovered HTTP route, and
 * fails the boot when the declared policy is not met.
 *
 * Runs at bootstrap rather than at plan time on purpose. The planner
 * only sees what it generates; a bootstrap sweep sees every controller
 * Nest assembled — module resources, hand-built configs, and
 * package-owned controllers like `MeController` and every
 * rockets-server-auth route. `validate-access-control.ts` names that gap
 * in its own documentation; this closes it.
 *
 * It also sees decorators the planner cannot: a hand-written
 * `AccessControlGrant` inside a bundle's `decorators: []` exists as real
 * metadata by the time this runs, where at plan time the controller has
 * not been built yet.
 */
@Injectable()
export class RouteAuditService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    @Optional()
    @Inject(ROCKETS_ROUTE_POLICY_TOKEN)
    private readonly policy?: RoutePolicy,
  ) {}

  onApplicationBootstrap(): void {
    if (!this.policy) return;

    const violations = evaluateRoutePolicy(this.audit(), this.policy);
    if (violations.length > 0) {
      throw new Error(formatPolicyViolations(violations));
    }
  }

  /**
   * The report itself, for a CI artifact or a diagnostics endpoint.
   *
   * Safe to call without a declared policy — auditing and enforcing are
   * separate so a team can look before it commits to a rule.
   */
  audit(): RouteAuditReport {
    return collectRouteAudit({
      controllers: this.scanControllers(),
      globalGuards: this.globalGuardNames(),
    });
  }

  private scanControllers(): ControllerScan[] {
    const scans: ControllerScan[] = [];

    for (const wrapper of this.discoveryService.getControllers()) {
      const controller = wrapper.metatype;
      if (typeof controller !== 'function') continue;

      const prototype: unknown = controller.prototype;
      if (typeof prototype !== 'object' || prototype === null) continue;

      scans.push({
        controller: controller as Type<unknown>,
        methodNames: this.metadataScanner.getAllMethodNames(prototype),
      });
    }

    return scans;
  }

  /**
   * Names of the app's global guards.
   *
   * Read through `DiscoveryService` rather than `ApplicationConfig`:
   * the latter holds the resolved instances but is not in
   * `@nestjs/core`'s export map, and reaching past a package's exports
   * for a diagnostic is not worth the coupling.
   *
   * The token is matched by PREFIX, not equality. Nest appends a uuid
   * to each global-enhancer token (`APP_GUARD (UUID: 392c3b38...)`) so
   * that several `APP_GUARD` providers can coexist, which an equality
   * check silently misses — and missing it would report a guarded app
   * as unguarded, the one direction this service must never get wrong.
   */
  private globalGuardNames(): string[] {
    const names: string[] = [];

    for (const wrapper of this.discoveryService.getProviders()) {
      const token: unknown = wrapper.token;
      if (typeof token !== 'string' || !token.startsWith(APP_GUARD)) continue;

      const metatype: unknown = wrapper.metatype;
      names.push(
        typeof metatype === 'function' && metatype.name
          ? metatype.name
          : APP_GUARD,
      );
    }

    return names;
  }
}
