import { describe, it, expect, vi } from 'vitest';
import {
  ExecutionContext,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';
import { RateLimit } from '../../decorators/rate-limit.decorator';
import type {
  RateLimitResult,
  RateLimitStoreInterface,
} from '../../domain/interfaces/rate-limit.interface';

function buildContext(args: {
  readonly decorated?: boolean;
  readonly setHeader?: (name: string, value: string) => void;
  readonly ip?: string;
  readonly method?: string;
}): ExecutionContext {
  class Handler {
    method() {}
  }
  const handler = Handler.prototype.method;
  const target = Handler;
  if (args.decorated) {
    RateLimit({ limit: 3, windowMs: 60_000 })(target, 'method', {
      value: handler,
      writable: true,
      enumerable: false,
      configurable: true,
    });
  }

  return {
    getHandler: () => handler,
    getClass: () => target,
    switchToHttp: () => ({
      getRequest: () => ({
        ip: args.ip ?? '127.0.0.1',
        method: args.method ?? 'GET',
        route: { path: '/probe' },
      }),
      getResponse: () => ({ setHeader: args.setHeader ?? (() => undefined) }),
    }),
  } as unknown as ExecutionContext;
}

function storeReturning(result: RateLimitResult): RateLimitStoreInterface {
  return { consume: vi.fn().mockResolvedValue(result) };
}

describe('RateLimitGuard', () => {
  it('is a no-op on a route without @RateLimit()', async () => {
    const store = storeReturning({
      allowed: true,
      limit: 3,
      remaining: 2,
      resetAt: Date.now() + 60_000,
    });
    const guard = new RateLimitGuard(new Reflector(), store);
    const ctx = buildContext({});

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(store.consume).not.toHaveBeenCalled();
  });

  it('allows a request within the limit and sets rate-limit headers', async () => {
    const setHeader = vi.fn();
    const store = storeReturning({
      allowed: true,
      limit: 3,
      remaining: 2,
      resetAt: 1_700_000_000_000,
    });
    const guard = new RateLimitGuard(new Reflector(), store);
    const ctx = buildContext({ decorated: true, setHeader });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '3');
    expect(setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '2');
    expect(setHeader).not.toHaveBeenCalledWith(
      'Retry-After',
      expect.anything(),
    );
  });

  it('rejects with 429 once the store reports the limit exceeded', async () => {
    const setHeader = vi.fn();
    const store = storeReturning({
      allowed: false,
      limit: 3,
      remaining: 0,
      resetAt: Date.now() + 5_000,
    });
    const guard = new RateLimitGuard(new Reflector(), store);
    const ctx = buildContext({ decorated: true, setHeader });

    await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
    await expect(guard.canActivate(ctx)).rejects.toMatchObject({
      status: 429,
    });
    expect(setHeader).toHaveBeenCalledWith('Retry-After', expect.any(String));
  });

  it('fails CLOSED (503) when the store throws, never lets the request through', async () => {
    const store: RateLimitStoreInterface = {
      consume: vi.fn().mockRejectedValue(new Error('store unavailable')),
    };
    const guard = new RateLimitGuard(new Reflector(), store);
    const ctx = buildContext({ decorated: true });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('uses a custom key resolver when provided', async () => {
    class Handler {
      method() {}
    }
    const handler = Handler.prototype.method;
    const keyFn = vi.fn().mockReturnValue('custom-key');
    RateLimit({ limit: 1, windowMs: 1000, key: keyFn })(Handler, 'method', {
      value: handler,
      writable: true,
      enumerable: false,
      configurable: true,
    });
    const store = storeReturning({
      allowed: true,
      limit: 1,
      remaining: 0,
      resetAt: Date.now() + 1000,
    });
    const guard = new RateLimitGuard(new Reflector(), store);
    const ctx = {
      getHandler: () => handler,
      getClass: () => Handler,
      switchToHttp: () => ({
        getRequest: () => ({ ip: '1.2.3.4', method: 'GET' }),
        getResponse: () => ({ setHeader: () => undefined }),
      }),
    } as unknown as ExecutionContext;

    await guard.canActivate(ctx);
    expect(keyFn).toHaveBeenCalledWith(ctx);
    expect(store.consume).toHaveBeenCalledWith('default:custom-key', 1, 1000);
  });

  it('the default key includes ip, method, and route', async () => {
    const store = storeReturning({
      allowed: true,
      limit: 3,
      remaining: 2,
      resetAt: Date.now() + 1000,
    });
    const guard = new RateLimitGuard(new Reflector(), store);
    const ctx = buildContext({
      decorated: true,
      ip: '9.9.9.9',
      method: 'POST',
    });

    await guard.canActivate(ctx);
    expect(store.consume).toHaveBeenCalledWith(
      'default:9.9.9.9:POST:/probe',
      3,
      60_000,
    );
  });
});

describe('named dimensions', () => {
  function contextFor(args: {
    readonly handlerPolicy?: Parameters<typeof RateLimit>[0];
    readonly classPolicy?: Parameters<typeof RateLimit>[0];
  }): ExecutionContext {
    class Ctrl {
      route() {}
    }
    const handler = Ctrl.prototype.route;
    if (args.handlerPolicy) {
      RateLimit(args.handlerPolicy)(Ctrl, 'route', {
        value: handler,
        writable: true,
        enumerable: false,
        configurable: true,
      });
    }
    if (args.classPolicy) {
      RateLimit(args.classPolicy)(Ctrl);
    }
    return {
      getHandler: () => handler,
      getClass: () => Ctrl,
      switchToHttp: () => ({
        getRequest: () => ({
          ip: '1.2.3.4',
          method: 'POST',
          route: { path: '/p' },
        }),
        getResponse: () => ({ setHeader: () => undefined }),
      }),
    } as unknown as ExecutionContext;
  }

  const allow = (limit: number): RateLimitResult => ({
    allowed: true,
    limit,
    remaining: limit - 1,
    resetAt: Date.now() + 1000,
  });

  it('enforces every app-default dimension once a route opts in', async () => {
    const store = {
      consume: vi
        .fn()
        .mockImplementation((_k, limit) =>
          Promise.resolve(allow(limit as number)),
        ),
    } satisfies RateLimitStoreInterface;
    const guard = new RateLimitGuard(new Reflector(), store, {
      dimensions: {
        ip: { limit: 100, windowMs: 60_000, key: () => 'the-ip' },
        default: { limit: 10, windowMs: 60_000, key: () => 'the-pair' },
      },
    });

    await guard.canActivate(contextFor({ handlerPolicy: {} }));

    expect(store.consume).toHaveBeenCalledWith('ip:the-ip', 100, 60_000);
    expect(store.consume).toHaveBeenCalledWith('default:the-pair', 10, 60_000);
  });

  // The defect this pins: replacing the whole dimension object on
  // override silently swapped an account-composite key for the default
  // per-IP one, sharing the fine counter across accounts — the exact
  // lockout the composite key exists to prevent.
  it('a route override keeps the dimension key it does not set', async () => {
    const store = {
      consume: vi
        .fn()
        .mockImplementation((_k, limit) =>
          Promise.resolve(allow(limit as number)),
        ),
    } satisfies RateLimitStoreInterface;
    const guard = new RateLimitGuard(new Reflector(), store, {
      dimensions: {
        default: { limit: 1000, windowMs: 60_000, key: () => 'composite' },
      },
    });

    await guard.canActivate(
      contextFor({
        handlerPolicy: { default: { limit: 5, windowMs: 30_000 } },
      }),
    );

    expect(store.consume).toHaveBeenCalledWith('default:composite', 5, 30_000);
  });

  it('a route with no metadata stays a no-op even with app defaults', async () => {
    const store = { consume: vi.fn() } satisfies RateLimitStoreInterface;
    const guard = new RateLimitGuard(new Reflector(), store, {
      dimensions: { ip: { limit: 1, windowMs: 1000 } },
    });

    await expect(guard.canActivate(contextFor({}))).resolves.toBe(true);
    expect(store.consume).not.toHaveBeenCalled();
  });

  it('rejects when ANY dimension rejects, and still counts the rest', async () => {
    const store = {
      consume: vi.fn().mockImplementation((key: string, limit: number) =>
        Promise.resolve(
          key.startsWith('ip:')
            ? {
                allowed: false,
                limit,
                remaining: 0,
                resetAt: Date.now() + 1000,
              }
            : allow(limit),
        ),
      ),
    } satisfies RateLimitStoreInterface;
    const guard = new RateLimitGuard(new Reflector(), store, {
      dimensions: {
        ip: { limit: 2, windowMs: 60_000, key: () => 'x' },
        default: { limit: 10, windowMs: 60_000, key: () => 'y' },
      },
    });

    await expect(
      guard.canActivate(contextFor({ handlerPolicy: {} })),
    ).rejects.toThrow(HttpException);
    // Both dimensions consumed: saturating the coarse ceiling must not
    // keep the fine counters clean.
    expect(store.consume).toHaveBeenCalledTimes(2);
  });

  it('disabled defaults turn the guard off entirely', async () => {
    const store = { consume: vi.fn() } satisfies RateLimitStoreInterface;
    const guard = new RateLimitGuard(new Reflector(), store, {
      disabled: true,
    });

    await expect(
      guard.canActivate(
        contextFor({ handlerPolicy: { limit: 1, windowMs: 1000 } }),
      ),
    ).resolves.toBe(true);
    expect(store.consume).not.toHaveBeenCalled();
  });
});
