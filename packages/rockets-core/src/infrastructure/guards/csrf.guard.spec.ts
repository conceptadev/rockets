import { describe, it, expect } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfGuard, type CsrfGuardOptions } from './csrf.guard';
import { AuthSession } from '../../decorators/auth-session.decorator';
import { generateCsrfToken } from '../auth/csrf-token';

const OPTIONS: CsrfGuardOptions = {
  secret: 'test-secret',
  sessionCookieName: '__session',
};

function buildContext(args: {
  readonly decorated?: boolean;
  readonly method: string;
  readonly cookie?: string;
  readonly csrfHeader?: string;
}): ExecutionContext {
  class Handler {
    method() {}
  }
  const handler = Handler.prototype.method;
  const target = Handler;
  if (args.decorated) {
    AuthSession()(target, 'method', {
      value: handler,
      writable: true,
      enumerable: false,
      configurable: true,
    });
  }

  const headers: Record<string, string> = {};
  if (args.cookie !== undefined) headers['cookie'] = args.cookie;
  if (args.csrfHeader !== undefined) headers['x-csrf-token'] = args.csrfHeader;

  return {
    getHandler: () => handler,
    getClass: () => target,
    switchToHttp: () => ({
      getRequest: () => ({ method: args.method, headers }),
    }),
  } as unknown as ExecutionContext;
}

describe('CsrfGuard', () => {
  const guard = new CsrfGuard(new Reflector(), OPTIONS);

  it('is a no-op on a route without @AuthSession()', () => {
    const ctx = buildContext({ method: 'POST' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('is a no-op on safe methods even on a session route', () => {
    const ctx = buildContext({ decorated: true, method: 'GET' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects a state-changing session request with no session cookie', () => {
    const ctx = buildContext({ decorated: true, method: 'POST' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('rejects a state-changing session request with no CSRF header', () => {
    const ctx = buildContext({
      decorated: true,
      method: 'POST',
      cookie: '__session=sess-1',
    });
    expect(() => guard.canActivate(ctx)).toThrow(/Missing CSRF token/);
  });

  it('rejects a state-changing session request with a wrong CSRF token', () => {
    const ctx = buildContext({
      decorated: true,
      method: 'POST',
      cookie: '__session=sess-1',
      csrfHeader: 'not-the-right-token',
    });
    expect(() => guard.canActivate(ctx)).toThrow(/Invalid CSRF token/);
  });

  it('accepts a state-changing session request with a valid CSRF token', () => {
    const token = generateCsrfToken('sess-1', OPTIONS.secret);
    const ctx = buildContext({
      decorated: true,
      method: 'POST',
      cookie: '__session=sess-1',
      csrfHeader: token,
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('a token minted for a DIFFERENT session value is rejected', () => {
    const token = generateCsrfToken('sess-OTHER', OPTIONS.secret);
    const ctx = buildContext({
      decorated: true,
      method: 'POST',
      cookie: '__session=sess-1',
      csrfHeader: token,
    });
    expect(() => guard.canActivate(ctx)).toThrow(/Invalid CSRF token/);
  });

  it('respects a custom header name', () => {
    const customGuard = new CsrfGuard(new Reflector(), {
      ...OPTIONS,
      headerName: 'x-custom-csrf',
    });
    const token = generateCsrfToken('sess-1', OPTIONS.secret);

    class Handler2 {
      method() {}
    }
    const handler = Handler2.prototype.method;
    AuthSession()(Handler2, 'method', {
      value: handler,
      writable: true,
      enumerable: false,
      configurable: true,
    });
    const ctx = {
      getHandler: () => handler,
      getClass: () => Handler2,
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          headers: { cookie: '__session=sess-1', 'x-custom-csrf': token },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(customGuard.canActivate(ctx)).toBe(true);
  });
});
