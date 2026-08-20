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
import {
  Controller,
  Get,
  Injectable,
  Module,
  Post,
  Scope,
  type Provider,
  type Type,
} from '@nestjs/common';
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
import { AccessControl } from 'accesscontrol';
import type { ExecutionContext } from '@nestjs/common';
import type { AccessControlServiceInterface } from '@concepta/nestjs-access-control';
import { z } from 'zod';
import { operationResource } from '../zod';
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

/** Request-scoped: Nest routes these to `injectables`, not `providers`. */
@Injectable({ scope: Scope.REQUEST })
class RequestScopedAuthGuard {
  canActivate(): boolean {
    return true;
  }
}

@Controller('status')
@ApiTags('Status')
@AuthPublic({ classLevel: true })
class StatusController {
  @Get()
  @ApiOkResponse({ description: 'Class-level public probe' })
  check(): void {}
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
  // `AllowAllGuard` stands in for an integration-owned auth guard, so
  // policies must recognise it explicitly — which also exercises the
  // `authGuards` escape hatch on every policy-carrying test.
  const policy: RoutePolicy | undefined = args.policy
    ? { authGuards: [AllowAllGuard], ...args.policy }
    : args.policy;
  @Module({
    imports: [DiscoveryModule],
    controllers: [InvoiceController, HealthController],
    providers: [
      RouteAuditService,
      InvoiceCanAccess,
      ...(args.withGuard
        ? [{ provide: APP_GUARD, useClass: AllowAllGuard }]
        : []),
      ...(policy
        ? [{ provide: ROCKETS_ROUTE_POLICY_TOKEN, useValue: policy }]
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
    // No policy declared -> nothing recognises AllowAllGuard as
    // authentication, and the report must NOT claim guarded routes.
    expect(report.authGuards).toEqual([]);

    const byId = Object.fromEntries(report.routes.map((r) => [r.id, r]));

    // Unrecognised guard -> the report refuses to call anything guarded.
    expect(byId['GET /invoices']).toMatchObject({
      authentication: 'unguarded-app',
      aclAction: ActionEnum.READ,
      aclResource: 'invoice',
      aclQuery: 'InvoiceCanAccess',
    });
    expect(byId['POST /invoices']).toMatchObject({
      authentication: 'unguarded-app',
      aclAction: ActionEnum.CREATE,
      aclQuery: null,
    });
    expect(byId['GET /health']).toMatchObject({ authentication: 'public' });
  });

  it('reports guarded once the policy recognises the guard', async () => {
    const app = await boot({
      withGuard: true,
      policy: {
        // No rules — recognition only. Declaring a rule would abort the
        // boot on the deliberately ungranted fixtures.
      },
    });
    const report = app.get(RouteAuditService).audit();
    await app.close();

    expect(report.authGuards).toEqual(['AllowAllGuard']);
    const byId = Object.fromEntries(report.routes.map((r) => [r.id, r]));
    expect(byId['GET /invoices']).toMatchObject({ authentication: 'guarded' });
    expect(byId['GET /invoices/summary']).toMatchObject({
      authentication: 'guarded',
      aclAction: null,
    });
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

// ── The two guard shapes the first revision judged wrong ──

describe('guard classification (e2e)', () => {
  const bootWith = async (args: {
    readonly providers: Provider[];
    readonly policy: RoutePolicy;
    readonly controllers?: Type<unknown>[];
  }) => {
    @Module({
      imports: [DiscoveryModule],
      controllers: args.controllers ?? [InvoiceController, HealthController],
      providers: [
        RouteAuditService,
        InvoiceCanAccess,
        { provide: ROCKETS_ROUTE_POLICY_TOKEN, useValue: args.policy },
        ...args.providers,
      ],
    })
    class TestModule {}
    const moduleRef = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    return app;
  };

  // Upstream access-control registers an APP_GUARD factory
  // unconditionally and resolves it to `null` when `appGuard: false`.
  // The first revision counted the WRAPPER: an app with zero
  // authentication reported every route as guarded and `requireAuth`
  // booted green. The exact configuration is any factory resolving to
  // null — reproduced here without dragging the ACL module in.
  it('a factory guard resolving to null is not authentication', async () => {
    await expect(
      bootWith({
        providers: [{ provide: APP_GUARD, useFactory: () => null }],
        policy: { requireAuth: true },
      }),
    ).rejects.toThrow(/no global guard/);
  });

  // A recognised-but-non-auth guard: present, resolved, and still not
  // authentication. The failure message must say the guards were seen.
  it('a non-auth global guard does not satisfy requireAuth', async () => {
    await expect(
      bootWith({
        providers: [{ provide: APP_GUARD, useClass: AllowAllGuard }],
        policy: { requireAuth: true },
      }),
    ).rejects.toThrow(/none is recognised as an AUTHENTICATION guard/);
  });

  // Request-scoped guards live in `injectables`, invisible to
  // DiscoveryService.getProviders() — the first revision hard-failed
  // this correctly guarded app.
  it('a request-scoped auth guard is seen and satisfies requireAuth', async () => {
    const app = await bootWith({
      providers: [{ provide: APP_GUARD, useClass: RequestScopedAuthGuard }],
      policy: {
        requireAuth: true,
        authGuards: [RequestScopedAuthGuard],
        allow: ['GET /health'],
      },
    });
    const report = app.get(RouteAuditService).audit();
    expect(report.authGuards).toEqual(['RequestScopedAuthGuard']);
    await app.close();
  });

  it('classifies class-level AuthPublic and reports it distinctly', async () => {
    const app = await bootWith({
      providers: [{ provide: APP_GUARD, useClass: AllowAllGuard }],
      policy: { authGuards: [AllowAllGuard] },
      controllers: [InvoiceController, StatusController],
    });
    const report = app.get(RouteAuditService).audit();
    await app.close();
    expect(
      report.routes.find((r) => r.id === 'GET /status')?.authentication,
    ).toBe('public-class');
  });

  // An allow list that can rot silently stops meaning anything.
  it('fails the boot on a stale allow entry', async () => {
    await expect(
      bootWith({
        providers: [{ provide: APP_GUARD, useClass: AllowAllGuard }],
        policy: {
          requireAuth: true,
          authGuards: [AllowAllGuard],
          allow: ['GET /health', 'GET /no-such-route'],
        },
      }),
    ).rejects.toThrow(/staleAllow.*GET \/no-such-route/);
  });
});

describe('routePolicy through RocketsCoreModule (e2e)', () => {
  const bootCore = async (policy?: RoutePolicy) => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(NoopAuthAdapter),
          providers: [NoopAuthAdapter],
          ...(policy
            ? { routePolicy: { authGuards: [AllowAllGuard], ...policy } }
            : {}),
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

// ── A GENERATED controller, not a hand-written fixture ──
//
// The audit's stated audience is planner-generated surface; every case
// above uses hand-written controllers. This wires an `operationResource`
// with `acl` through `RocketsCoreModule` and asserts the audit reads the
// grants Rockets itself stamped.

const auditAcRules = new AccessControl();
auditAcRules.grant('user').resource('gizmo').updateAny().readAny();

class AuditAcService implements AccessControlServiceInterface {
  async getUser(context: ExecutionContext): Promise<unknown> {
    return context.switchToHttp().getRequest().user;
  }
  async getUserRoles(): Promise<string[]> {
    return ['user'];
  }
}

const gizmoOps = operationResource({
  path: 'gizmos',
  tags: ['Gizmos'],
  acl: { resource: 'gizmo' },
  operations: (op) => ({
    relabel: op.write({
      acl: 'update',
      input: z.object({ label: z.string() }),
      output: z.object({ ok: z.boolean() }),
      handler: () => ({ ok: true }),
    }),
    peek: op.read({
      // Deliberately ungranted: must surface as the requireAcl finding.
      acl: false,
      output: z.object({ seen: z.boolean() }),
      handler: () => ({ seen: true }),
    }),
  }),
});

describe('routePolicy over a generated operation resource (e2e)', () => {
  it('reads the grants Rockets stamped on its own generated controller', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(NoopAuthAdapter),
          providers: [NoopAuthAdapter],
          resources: [gizmoOps],
          accessControl: {
            service: new AuditAcService(),
            settings: { rules: auditAcRules },
            appFilter: false,
            appGuard: false,
          },
          routePolicy: { authGuards: [AllowAllGuard] },
          global: true,
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AllowAllGuard }],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    const report = app.get(RouteAuditService).audit();
    await app.close();

    // The ACL module registers an APP_GUARD factory unconditionally;
    // with `appGuard: false` it resolves to null and must NOT appear.
    // Asserted on globalGuards EQUALITY, not just authGuards: a counted
    // null wrapper would never classify as auth, so the weaker
    // assertion survives the exact wrapper-counting bug this pins.
    expect(report.globalGuards).toEqual(['AllowAllGuard']);
    expect(report.authGuards).toEqual(['AllowAllGuard']);

    const byId = Object.fromEntries(report.routes.map((r) => [r.id, r]));
    expect(byId['POST /gizmos/relabel']).toMatchObject({
      authentication: 'guarded',
      aclAction: 'update',
      aclResource: 'gizmo',
    });
    // `acl: false` is a recorded opt-out: no grant metadata on the route.
    expect(byId['GET /gizmos/peek']).toMatchObject({
      authentication: 'guarded',
      aclAction: null,
    });
  });
});
