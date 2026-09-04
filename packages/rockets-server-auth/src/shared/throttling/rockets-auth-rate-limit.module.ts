import { Global, Module, type DynamicModule } from '@nestjs/common';
import {
  InMemoryRateLimitStore,
  RATE_LIMIT_DEFAULTS_TOKEN,
  RATE_LIMIT_MAX_KEYS_TOKEN,
  RATE_LIMIT_STORE_TOKEN,
  RateLimitGuard,
  type RateLimitDefaults,
} from '@concepta/rockets-core';

import type { RocketsAuthThrottlingOptions } from '../interfaces/rockets-auth-throttling-options.interface';
import {
  authAccountRateLimitKey,
  authIpRateLimitKey,
} from './auth-rate-limit-keys';

/**
 * Registers core's rate-limit port for the auth routes — the successor
 * of the `ThrottlerModule.forRoot` registration (upstream
 * `@nestjs/throttler` caps its peers at Nest 11 and made
 * `npm install @concepta/rockets-auth` unresolvable on Nest 12).
 *
 * `@Global()` for the same reason `ThrottlerModule` is: the guard is
 * applied with `@UseGuards(RateLimitGuard)` on controllers declared in
 * several feature sub-modules, and an enhancer class resolves its
 * dependencies from the injector of the module that declares the
 * controller. The tokens are core's canonical ones, but they are provided
 * HERE: a module-local provider wins over a global one in its own
 * injector, so an app that registers its own `RATE_LIMIT_STORE_TOKEN`
 * elsewhere gets that store for its own routes and this one for the auth
 * routes — two stores, and on a multi-instance deployment the auth limits
 * stay per process while the operator believes Redis is wired.
 * `throttling.store` (and `throttling.maxKeys`) is what changes the store
 * the auth routes use.
 *
 * Defaults preserve the previous engine's behaviour exactly:
 * a 1000/min per-IP ceiling no route overrides, and a 1000/min
 * per-`(ip, account)` dimension the auth routes tighten with
 * `@RateLimit({ default: { … } })`. `throttling: false` disables the
 * guard while keeping every provider resolvable, so `@UseGuards`
 * references never dangle.
 */
@Global()
@Module({})
export class RocketsAuthRateLimitModule {
  static forRoot(
    throttling: false | RocketsAuthThrottlingOptions | undefined,
  ): DynamicModule {
    const defaults = buildAuthRateLimitDefaults(throttling);
    const options =
      throttling === false || throttling === undefined ? undefined : throttling;
    const store = options?.store ?? InMemoryRateLimitStore;

    return {
      module: RocketsAuthRateLimitModule,
      providers: [
        { provide: RATE_LIMIT_DEFAULTS_TOKEN, useValue: defaults },
        // The store is constructed in THIS module's injector, so its own
        // `@Optional()` dependencies resolve here — `maxKeys` has to be
        // provided alongside it or the default store is uncapped at
        // whatever core's constant says, with no way in from options.
        {
          provide: RATE_LIMIT_MAX_KEYS_TOKEN,
          useValue: options?.maxKeys,
        },
        { provide: RATE_LIMIT_STORE_TOKEN, useClass: store },
        RateLimitGuard,
      ],
      // `RATE_LIMIT_MAX_KEYS_TOKEN` is deliberately NOT exported: the only
      // thing that reads it is the store constructed in this module, and
      // this module is `@Global()`, so exporting the token would publish
      // it app-wide for nothing (AGENTS.md rule 14 — export the minimum).
      exports: [
        RATE_LIMIT_DEFAULTS_TOKEN,
        RATE_LIMIT_STORE_TOKEN,
        RateLimitGuard,
      ],
    };
  }
}

function buildAuthRateLimitDefaults(
  throttling: false | RocketsAuthThrottlingOptions | undefined,
): RateLimitDefaults {
  if (throttling === false) {
    return { disabled: true };
  }
  return {
    dimensions: {
      ip: {
        limit: throttling?.ip?.limit ?? 1000,
        windowMs: throttling?.ip?.windowMs ?? 60_000,
        key: authIpRateLimitKey,
      },
      default: {
        limit: throttling?.default?.limit ?? 1000,
        windowMs: throttling?.default?.windowMs ?? 60_000,
        key: authAccountRateLimitKey,
      },
    },
  };
}
