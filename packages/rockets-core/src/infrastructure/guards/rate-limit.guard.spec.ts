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
    expect(store.consume).toHaveBeenCalledWith('custom-key', 1, 1000);
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
      '9.9.9.9:POST:/probe',
      3,
      60_000,
    );
  });
});
