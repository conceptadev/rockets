import { describe, it, expect } from 'vitest';
import { Controller, Get, Post } from '@nestjs/common';
import { AuthPublic } from '@concepta/nestjs-authentication';
import { collectRouteAudit } from './collect-route-audit';
import { AuthSession } from '../../decorators/auth-session.decorator';

@Controller('profile')
class ProfileController {
  @Get()
  read() {}

  @AuthSession()
  @Post()
  update() {}
}

@Controller('health')
class HealthController {
  @AuthPublic()
  @Get()
  ping() {}
}

@Controller('contradiction')
class ContradictionController {
  @AuthPublic()
  @AuthSession()
  @Post()
  bad() {}
}

describe('collectRouteAudit — sessionAuth (issue #58)', () => {
  it('reports sessionAuth: false on a route without @AuthSession()', () => {
    const report = collectRouteAudit({
      controllers: [
        { controller: ProfileController, methodNames: ['read', 'update'] },
      ],
      globalGuards: ['AuthServerGuard'],
      authGuards: ['AuthServerGuard'],
    });

    const readRoute = report.routes.find((r) => r.handler === 'read');
    expect(readRoute?.sessionAuth).toBe(false);
    expect(readRoute?.authentication).toBe('guarded');
  });

  it('reports sessionAuth: true on an @AuthSession() route, still guarded', () => {
    const report = collectRouteAudit({
      controllers: [
        { controller: ProfileController, methodNames: ['read', 'update'] },
      ],
      globalGuards: ['AuthServerGuard'],
      authGuards: ['AuthServerGuard'],
    });

    const updateRoute = report.routes.find((r) => r.handler === 'update');
    expect(updateRoute?.sessionAuth).toBe(true);
    expect(updateRoute?.authentication).toBe('guarded');
  });

  it('a public route reports sessionAuth: false', () => {
    const report = collectRouteAudit({
      controllers: [{ controller: HealthController, methodNames: ['ping'] }],
      globalGuards: ['AuthServerGuard'],
      authGuards: ['AuthServerGuard'],
    });

    const route = report.routes[0];
    expect(route?.authentication).toBe('public');
    expect(route?.sessionAuth).toBe(false);
  });

  it('throws when @AuthPublic and @AuthSession are declared on the same handler', () => {
    expect(() =>
      collectRouteAudit({
        controllers: [
          { controller: ContradictionController, methodNames: ['bad'] },
        ],
        globalGuards: ['AuthServerGuard'],
        authGuards: ['AuthServerGuard'],
      }),
    ).toThrow(/declares both @AuthPublic and @AuthSession/);
  });
});
