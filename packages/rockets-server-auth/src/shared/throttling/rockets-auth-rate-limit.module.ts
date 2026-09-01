import { Global, Module, type DynamicModule } from '@nestjs/common';
import {
  InMemoryRateLimitStore,
  RATE_LIMIT_DEFAULTS_TOKEN,
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
 * controller. The three tokens exported here are core's canonical ones,
 * so an app that registers its own `RATE_LIMIT_STORE_TOKEN` shares one
 * store with the auth routes — pass `throttling.store` to change what
 * the auth registration provides.
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
    const store =
      throttling === false || throttling === undefined
        ? InMemoryRateLimitStore
        : throttling.store ?? InMemoryRateLimitStore;

    return {
      module: RocketsAuthRateLimitModule,
      providers: [
        { provide: RATE_LIMIT_DEFAULTS_TOKEN, useValue: defaults },
        { provide: RATE_LIMIT_STORE_TOKEN, useClass: store },
        RateLimitGuard,
      ],
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
