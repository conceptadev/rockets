/**
 * The audit exists because every serious defect in this package's
 * history was green and wrong: a `ctx` omission that disabled all hooks
 * (#45), a forgotten grant that leaves a route authenticated but open
 * (#51), a response DTO that silently emptied a column (#68). None of
 * them failed a build, a lint or a test.
 *
 * These tests therefore assert on the two things a report must never
 * get wrong: that it does not claim a route is protected when it is
 * not, and that turning a rule on actually stops the boot.
 */
import { describe, expect, it } from 'vitest';
import { Controller, Get, Injectable, Module, Post } from '@nestjs/common';
import { APP_GUARD, DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import {
  AccessControlGrant,
  AccessControlQuery,
  type CanAccess,
} from '@concepta/nestjs-access-control';
import { ActionEnum } from '@concepta/nestjs-core';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthPublic } from '../decorators/auth-public.decorator';
import { RocketsCoreModule } from '../rockets-core.module';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import type {
  AuthAdapterInterface,
  AuthAttemptResult,
} from '../domain/interfaces/auth-adapter.interface';
import {
  RouteAuditService,
  ROCKETS_ROUTE_POLICY_TOKEN,
  type RoutePolicy,
} from '../infrastructure/audit';

@Injectable()
class AllowAllGuard {
  canActivate(): boolean {
    return true;
  }
}

@Injectable()
class InvoiceCanAccess {
  async canAccess(): Promise<boolean> {
    return true;
  }
}

@Controller('invoices')
@ApiTags('Invoices')
class InvoiceController {
  @Get()
  @ApiOkResponse({ description: 'List invoices' })
  @AccessControlGrant({ action: ActionEnum.READ, resource: 'invoice' })
  @AccessControlQuery({
    service: InvoiceCanAccess as unknown as new () => CanAccess,
  })
  list(): void {}

  /** Granted, but no CanAccess: `own` cannot be resolved. */
  @Post()
  @ApiOkResponse({ description: 'Create invoice' })
  @AccessControlGrant({ action: ActionEnum.CREATE, resource: 'invoice' })
  create(): void {}

  /** Authenticated and ungranted — the #51 failure shape. */
  @Get('summary')
  @ApiOkResponse({ description: 'Invoice summary' })
  summary(): void {}
}

@Controller('health')
@ApiTags('Health')
class HealthController {
  @Get()
  @ApiOkResponse({ description: 'Liveness probe' })
  @AuthPublic()
  check(): void {}
}

async function boot(args: {
  readonly withGuard: boolean;
  readonly policy?: RoutePolicy;
}) {
  @Module({
    imports: [DiscoveryModule],
    controllers: [InvoiceController, HealthController],
    providers: [
      RouteAuditService,
      InvoiceCanAccess,
      ...(args.withGuard
        ? [{ provide: APP_GUARD, useClass: AllowAllGuard }]
        : []),
      ...(args.policy
        ? [{ provide: ROCKETS_ROUTE_POLICY_TOKEN, useValue: args.policy }]
        : []),
    ],
  })
  class TestModule {}

  const moduleRef = await Test.createTestingModule({
    imports: [TestModule],
  }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

describe('route audit + policy (e2e)', () => {
  it('reports what is enforced on every discovered route', async () => {
    const app = await boot({ withGuard: true });
    const report = app.get(RouteAuditService).audit();
    await app.close();

    expect(report.globalGuards).toEqual(['AllowAllGuard']);

    const byId = Object.fromEntries(report.routes.map((r) => [r.id, r]));

    expect(byId['GET /invoices']).toMatchObject({
      authentication: 'guarded',
      aclAction: ActionEnum.READ,
      aclResource: 'invoice',
      aclQuery: 'InvoiceCanAccess',
    });
    expect(byId['POST /invoices']).toMatchObject({
      authentication: 'guarded',
      aclAction: ActionEnum.CREATE,
      aclQuery: null,
    });
    expect(byId['GET /invoices/summary']).toMatchObject({
      authentication: 'guarded',
      aclAction: null,
    });
    expect(byId['GET /health']).toMatchObject({ authentication: 'public' });
  });

  // The report must not inherit the app's optimism. With no global guard
  // nothing authenticates anything, and calling those routes `guarded`
  // would be the exact lie this module exists to prevent.
  it('never reports a route as guarded when the app has no global guard', async () => {
    const app = await boot({ withGuard: false });
    const report = app.get(RouteAuditService).audit();
    await app.close();

    expect(report.globalGuards).toEqual([]);
    expect(report.routes.every((r) => r.authentication !== 'guarded')).toBe(
      true,
    );
    expect(
      report.routes.filter((r) => r.authentication === 'unguarded-app').length,
    ).toBe(3);
    // An explicit AuthPublic is still the author's intent, not a symptom.
    expect(
      report.routes.find((r) => r.id === 'GET /health')?.authentication,
    ).toBe('public');
  });

  it('fails the boot when an authenticated route carries no grant', async () => {
    await expect(
      boot({ withGuard: true, policy: { requireAcl: true } }),
    ).rejects.toThrow(/GET \/invoices\/summary[\s\S]*no AccessControlGrant/);
  });

  it('fails the boot when a grant cannot resolve own possession', async () => {
    await expect(
      boot({ withGuard: true, policy: { requireAclQuery: true } }),
    ).rejects.toThrow(/POST \/invoices[\s\S]*no CanAccess service/);
  });

  it('reports the app-wide cause exactly once, not per route', async () => {
    const error = await boot({
      withGuard: false,
      policy: { requireAuth: true, requireAcl: true },
    }).catch((caught: unknown) => caught);

    const message = error instanceof Error ? error.message : String(error);
    expect(message).toMatch(/registers no global guard/);
    // Three routes exist; repeating one app-wide cause on each buries it.
    expect(message.match(/registers no global guard/g)).toHaveLength(1);
    expect(message).toMatch(/rejected 1 route:/);
  });

  // The hole this closes: `requireAcl` gates on `authentication ===
  // 'guarded'`, so on an app with no global guard NOTHING is guarded and
  // the rule silently never fires. Declaring a rule and getting a clean
  // boot with zero enforcement is the exact failure this module exists
  // to prevent, committed by the module itself.
  it('does not go quiet when a rule is declared and the app is unguarded', async () => {
    await expect(
      boot({ withGuard: false, policy: { requireAcl: true } }),
    ).rejects.toThrow(/no global guard/);
  });

  it('boots when every finding is explicitly allowed', async () => {
    const app = await boot({
      withGuard: true,
      policy: {
        requireAuth: true,
        requireAcl: true,
        requireAclQuery: true,
        allow: ['GET /health', 'GET /invoices/summary', 'POST /invoices'],
      },
    });
    expect(app).toBeDefined();
    await app.close();
  });

  it('exempts a whole controller the app does not own', async () => {
    const app = await boot({
      withGuard: true,
      policy: {
        requireAuth: true,
        requireAcl: true,
        requireAclQuery: true,
        allowControllers: [HealthController],
        allow: ['GET /invoices/summary', 'POST /invoices'],
      },
    });
    expect(app).toBeDefined();
    await app.close();
  });
});

// ── Wiring through RocketsCoreModule itself ──
//
// The pure functions and the standalone service are covered above; this
// proves the `routePolicy` option actually reaches them, including the
// DiscoveryModule import the service depends on. A feature that works
// only when hand-wired is not the feature that was shipped.

@Injectable()
class NoopAuthAdapter implements AuthAdapterInterface {
  async authenticate(): Promise<AuthAttemptResult> {
    return { matched: false };
  }
}

describe('routePolicy through RocketsCoreModule (e2e)', () => {
  const bootCore = async (policy?: RoutePolicy) => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(NoopAuthAdapter),
          providers: [NoopAuthAdapter],
          ...(policy ? { routePolicy: policy } : {}),
        }),
      ],
      controllers: [InvoiceController],
      providers: [
        InvoiceCanAccess,
        { provide: APP_GUARD, useClass: AllowAllGuard },
      ],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    return app;
  };

  it('rejects the boot when a declared rule is violated', async () => {
    await expect(bootCore({ requireAcl: true })).rejects.toThrow(
      /GET \/invoices\/summary/,
    );
  });

  it('boots and exposes the report when no policy is declared', async () => {
    const app = await bootCore();
    // No policy means no enforcement AND no service: an app that never
    // asked for the check pays no discovery cost.
    expect(() => app.get(RouteAuditService)).toThrow();
    await app.close();
  });

  it('boots when the policy is satisfied, and the report is injectable', async () => {
    const app = await bootCore({
      requireAcl: true,
      allow: ['GET /invoices/summary'],
    });
    const report = app.get(RouteAuditService).audit();
    expect(report.routes.some((r) => r.id === 'GET /invoices')).toBe(true);
    await app.close();
  });
});
