import { describe, it, expect } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfGuard, type CsrfGuardOptions } from './csrf.guard';
import { AuthSession } from '../../decorators/auth-session.decorator';
import { generateCsrfToken } from '../auth/csrf-token';

// 32+ chars: the guard refuses to boot below MIN_CSRF_SECRET_LENGTH.
const OPTIONS: CsrfGuardOptions = {
  secret: 'test-secret-0123456789abcdef0123456789',
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

  // Node lower-cases every inbound header name, so a request never
  // carries an `X-CSRF-Token` key — only `x-csrf-token`. Reading
  // `headers[headerName]` verbatim meant this extremely common naming
  // convention rejected EVERY state-changing session request. The e2e
  // suite proves the same thing through real supertest headers; this
  // pins the guard's own normalisation.
  it('matches a mixed-case headerName against the lower-cased request header', () => {
    const customGuard = new CsrfGuard(new Reflector(), {
      ...OPTIONS,
      headerName: 'X-CSRF-Token',
    });
    const token = generateCsrfToken('sess-1', OPTIONS.secret);

    class Handler3 {
      method() {}
    }
    const handler = Handler3.prototype.method;
    AuthSession()(Handler3, 'method', {
      value: handler,
      writable: true,
      enumerable: false,
      configurable: true,
    });
    const ctx = {
      getHandler: () => handler,
      getClass: () => Handler3,
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          // As Node delivers it: lower-cased.
          headers: { cookie: '__session=sess-1', 'x-csrf-token': token },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(customGuard.canActivate(ctx)).toBe(true);
  });
});

// Misconfiguration must abort the BOOT, not surface as a 500 on the
// first protected write (`secret: undefined`) or as a silently
// worthless HMAC that never fails at all (`secret: ''`).
describe('CsrfGuard — configuration is validated at construction', () => {
  function build(options: Partial<CsrfGuardOptions>): () => CsrfGuard {
    return () =>
      new CsrfGuard(new Reflector(), {
        ...OPTIONS,
        ...options,
      } as CsrfGuardOptions);
  }

  it('throws on a missing secret', () => {
    expect(build({ secret: undefined as unknown as string })).toThrow(
      /`secret` is required/,
    );
  });

  it('throws on an empty secret', () => {
    expect(build({ secret: '' })).toThrow(/`secret` is required/);
  });

  it('throws on a secret shorter than the minimum', () => {
    expect(build({ secret: 'short-secret' })).toThrow(/at least 32/);
  });

  it('throws on a missing sessionCookieName', () => {
    expect(
      build({ sessionCookieName: undefined as unknown as string }),
    ).toThrow(/`sessionCookieName` is required/);
  });

  it('accepts a secret at exactly the minimum length', () => {
    expect(build({ secret: 'a'.repeat(32) })).not.toThrow();
  });
});
