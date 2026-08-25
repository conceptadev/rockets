import { vi, describe, it, expect } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import type { AuthRequest } from '@concepta/rockets-core';

import {
  FIREBASE_AUTH_MODULE_OPTIONS_TOKEN,
  FIREBASE_SESSION_COOKIE_VERIFIER_TOKEN,
  FIREBASE_USER_RESOLVER_TOKEN,
} from '../constants/firebase-auth.constants';
import { FirebaseSessionCookieAdapter } from '../adapters/firebase-session-cookie.adapter';
import { FirebaseAuthException } from '../exceptions/firebase-auth.exception';
import {
  FirebaseSessionCookieInvalidException,
  FirebaseSessionCookieRevokedException,
  FirebaseTokenMissingSubjectException,
} from '../exceptions/firebase-token-invalid.exception';
import { FirebaseAuthModuleOptions } from '../interfaces/firebase-auth-options.interface';
import { FirebaseDecodedTokenInterface } from '../interfaces/firebase-decoded-token.interface';
import {
  FirebaseSessionCookieVerifierInterface,
  FirebaseVerifyOptions,
} from '../interfaces/firebase-token-verifier.interface';
import { FirebaseUserResolverInterface } from '../interfaces/firebase-user-resolver.interface';
import { DefaultFirebaseUserResolverService } from '../services/default-firebase-user-resolver.service';

function makeRequest(cookie?: string): AuthRequest {
  return {
    headers: cookie !== undefined ? { cookie } : {},
    query: {},
    raw: {},
  };
}

class StubVerifier implements FirebaseSessionCookieVerifierInterface {
  constructor(
    private readonly behavior:
      | { kind: 'resolve'; token: FirebaseDecodedTokenInterface }
      | { kind: 'reject'; error: unknown },
  ) {}

  async verifySessionCookie(
    _cookie: string,
    _options?: FirebaseVerifyOptions,
  ): Promise<FirebaseDecodedTokenInterface> {
    if (this.behavior.kind === 'reject') {
      throw this.behavior.error;
    }
    return this.behavior.token;
  }

  async createSessionCookie(): Promise<string> {
    throw new Error('not used by this adapter');
  }
}

/**
 * A stub that actually HONOURS `checkRevoked`, unlike one that accepts
 * the option and ignores it — the shape that let a test "prove"
 * revocation handling while the adapter passed no options at all.
 * Stands in for firebase-admin, which raises
 * `auth/session-cookie-revoked` (or `auth/user-disabled`) from the very
 * lookup that `checkRevoked: false` skips.
 */
class RevocationAwareVerifier
  implements FirebaseSessionCookieVerifierInterface
{
  readonly calls: (FirebaseVerifyOptions | undefined)[] = [];

  constructor(private readonly revokedCode: string) {}

  async verifySessionCookie(
    _cookie: string,
    options?: FirebaseVerifyOptions,
  ): Promise<FirebaseDecodedTokenInterface> {
    this.calls.push(options);
    if (options?.checkRevoked === true) {
      throw Object.assign(new Error('session revoked'), {
        code: this.revokedCode,
      });
    }
    // Without the revocation lookup the cookie's signature and expiry
    // still check out — which is exactly why the bug was invisible.
    return { uid: 'revoked-user', sub: 'revoked-user' };
  }

  async createSessionCookie(): Promise<string> {
    throw new Error('not used by this adapter');
  }
}

class ExplodingResolver implements FirebaseUserResolverInterface {
  async resolve(): Promise<never> {
    throw new Error('local user lookup failed');
  }
}

async function makeAdapter(opts: {
  verifier: FirebaseSessionCookieVerifierInterface;
  resolver?: FirebaseUserResolverInterface;
  options?: Partial<FirebaseAuthModuleOptions>;
}): Promise<FirebaseSessionCookieAdapter> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    providers: [
      FirebaseSessionCookieAdapter,
      {
        provide: FIREBASE_SESSION_COOKIE_VERIFIER_TOKEN,
        useValue: opts.verifier,
      },
      {
        provide: FIREBASE_USER_RESOLVER_TOKEN,
        useValue: opts.resolver ?? new DefaultFirebaseUserResolverService(),
      },
      {
        provide: FIREBASE_AUTH_MODULE_OPTIONS_TOKEN,
        useValue: {
          firebaseApp: {},
          checkRevoked: false,
          ...opts.options,
        } satisfies FirebaseAuthModuleOptions,
      },
    ],
  }).compile();

  return moduleRef.get(FirebaseSessionCookieAdapter);
}

describe(FirebaseSessionCookieAdapter.name, () => {
  describe('no credential', () => {
    it('returns matched: false when no cookie header is present', async () => {
      const verify = vi.fn();
      const adapter = await makeAdapter({
        verifier: {
          verifySessionCookie: verify,
        } as unknown as FirebaseSessionCookieVerifierInterface,
      });

      const result = await adapter.authenticate(makeRequest());
      expect(result).toEqual({ matched: false });
      expect(verify).not.toHaveBeenCalled();
    });

    it('returns matched: false when the session cookie is not present among others', async () => {
      const verify = vi.fn();
      const adapter = await makeAdapter({
        verifier: {
          verifySessionCookie: verify,
        } as unknown as FirebaseSessionCookieVerifierInterface,
      });

      const result = await adapter.authenticate(makeRequest('other=1'));
      expect(result).toEqual({ matched: false });
      expect(verify).not.toHaveBeenCalled();
    });

    it('respects a custom cookie name from module options', async () => {
      const verify = vi.fn();
      const adapter = await makeAdapter({
        verifier: {
          verifySessionCookie: verify,
        } as unknown as FirebaseSessionCookieVerifierInterface,
        options: { sessionCookie: { cookieName: 'my_session' } },
      });

      const notMatched = await adapter.authenticate(
        makeRequest('__session=abc'),
      );
      expect(notMatched).toEqual({ matched: false });
      expect(verify).not.toHaveBeenCalled();
    });
  });

  describe('verifier failures', () => {
    it('maps a generic verify failure to FirebaseSessionCookieInvalidException', async () => {
      const adapter = await makeAdapter({
        verifier: new StubVerifier({
          kind: 'reject',
          error: Object.assign(new Error('expired'), {
            code: 'auth/session-cookie-expired',
          }),
        }),
      });

      const result = await adapter.authenticate(
        makeRequest('__session=expired'),
      );
      expect(result).toMatchObject({ matched: true });
      if ('error' in result) {
        expect(result.error).toBeInstanceOf(
          FirebaseSessionCookieInvalidException,
        );
      }
    });

    it('maps `auth/session-cookie-revoked` to FirebaseSessionCookieRevokedException', async () => {
      const adapter = await makeAdapter({
        verifier: new StubVerifier({
          kind: 'reject',
          error: Object.assign(new Error('revoked'), {
            code: 'auth/session-cookie-revoked',
          }),
        }),
      });

      const result = await adapter.authenticate(
        makeRequest('__session=revoked'),
      );
      expect(result).toMatchObject({ matched: true });
      if ('error' in result) {
        expect(result.error).toBeInstanceOf(
          FirebaseSessionCookieRevokedException,
        );
      }
    });

    it('handles non-Error rejections from the verifier', async () => {
      const adapter = await makeAdapter({
        verifier: new StubVerifier({
          kind: 'reject',
          error: 'something went wrong',
        }),
      });

      const result = await adapter.authenticate(makeRequest('__session=bad'));
      expect(result).toMatchObject({ matched: true });
      if ('error' in result) {
        expect(result.error).toBeInstanceOf(
          FirebaseSessionCookieInvalidException,
        );
      }
    });
  });

  /**
   * The adapter called `verifySessionCookie(cookie)` with NO options,
   * and `FirebaseTokenVerifierService` defaults `checkRevoked` to false
   * internally — so firebase-admin never performed the revocation
   * lookup and a revoked or disabled user's session cookie kept working
   * for its full lifetime (up to 14 days).
   */
  describe('revocation checking', () => {
    it('forwards checkRevoked: true by default — a session cookie is a 14-day credential', async () => {
      const verifySessionCookie = vi
        .fn()
        .mockResolvedValue({ uid: 'user-1', sub: 'user-1' });

      const adapter = await makeAdapter({
        verifier: {
          verifySessionCookie,
          createSessionCookie: vi.fn(),
        },
      });

      await adapter.authenticate(makeRequest('__session=cookie-value'));

      expect(verifySessionCookie).toHaveBeenCalledWith('cookie-value', {
        checkRevoked: true,
      });
    });

    it('honours an explicit sessionCookie.checkRevoked: false opt-out', async () => {
      const verifySessionCookie = vi
        .fn()
        .mockResolvedValue({ uid: 'user-1', sub: 'user-1' });

      const adapter = await makeAdapter({
        verifier: {
          verifySessionCookie,
          createSessionCookie: vi.fn(),
        },
        options: { sessionCookie: { checkRevoked: false } },
      });

      await adapter.authenticate(makeRequest('__session=cookie-value'));

      expect(verifySessionCookie).toHaveBeenCalledWith('cookie-value', {
        checkRevoked: false,
      });
    });

    // Behavioural, not a call-shape assertion: this verifier only fails
    // when the revocation lookup actually happens. Revert the adapter to
    // `verifySessionCookie(cookie)` and it authenticates the revoked
    // user successfully instead.
    it('REJECTS a revoked session cookie', async () => {
      const verifier = new RevocationAwareVerifier(
        'auth/session-cookie-revoked',
      );
      const adapter = await makeAdapter({ verifier });

      const result = await adapter.authenticate(
        makeRequest('__session=revoked-but-well-formed'),
      );

      // Unconditional. `AuthAttemptResult` is a union of
      // `{matched,user}` and `{matched,error}`, so `toMatchObject({
      // matched: true })` alone is satisfied by BOTH arms and an
      // `if ('error' in result)` narrowing quietly skips its assertion
      // when the adapter returns the wrong one.
      expect('error' in result).toBe(true);
      expect('user' in result).toBe(false);
      if ('error' in result) {
        expect(result.error).toBeInstanceOf(
          FirebaseSessionCookieRevokedException,
        );
      }
      expect(verifier.calls).toEqual([{ checkRevoked: true }]);
    });

    // Same underlying lookup, different firebase-admin code: a disabled
    // account's still-valid session cookie must stop working too.
    it('REJECTS a disabled user’s session cookie', async () => {
      const verifier = new RevocationAwareVerifier('auth/user-disabled');
      const adapter = await makeAdapter({ verifier });

      const result = await adapter.authenticate(
        makeRequest('__session=disabled-user'),
      );

      expect('error' in result).toBe(true);
      expect('user' in result).toBe(false);
      if ('error' in result) {
        expect(result.error).toBeInstanceOf(
          FirebaseSessionCookieRevokedException,
        );
      }
    });

    // The other half of the proof: with the opt-out the SAME verifier
    // lets the same revoked cookie through. If this passed while the
    // test above also passed under a no-options adapter, neither would
    // be testing anything.
    it('accepts that same revoked cookie once checkRevoked is opted out', async () => {
      const verifier = new RevocationAwareVerifier(
        'auth/session-cookie-revoked',
      );
      const adapter = await makeAdapter({
        verifier,
        options: { sessionCookie: { checkRevoked: false } },
      });

      const result = await adapter.authenticate(
        makeRequest('__session=revoked-but-well-formed'),
      );

      // Unconditional, and this is the assertion that makes the PAIR
      // mean something: if the adapter stopped forwarding the option,
      // this verifier would reject here too and both this test and the
      // REJECTS one above would pass while proving nothing.
      expect('user' in result).toBe(true);
      expect('error' in result).toBe(false);
      if ('user' in result) {
        expect(result.user.id).toBe('revoked-user');
      }
      expect(verifier.calls).toEqual([{ checkRevoked: false }]);
    });
  });

  describe('decoded token validation', () => {
    it('returns FirebaseTokenMissingSubjectException when decoded token has no uid', async () => {
      const adapter = await makeAdapter({
        verifier: new StubVerifier({
          kind: 'resolve',
          token: { uid: '', sub: '' },
        }),
      });

      const result = await adapter.authenticate(
        makeRequest('__session=no-uid'),
      );
      expect(result).toMatchObject({ matched: true });
      if ('error' in result) {
        expect(result.error).toBeInstanceOf(
          FirebaseTokenMissingSubjectException,
        );
      }
    });
  });

  describe('user resolver', () => {
    it('returns the AuthorizedUser when everything is happy', async () => {
      const adapter = await makeAdapter({
        verifier: new StubVerifier({
          kind: 'resolve',
          token: {
            uid: 'fb-uid-123',
            sub: 'fb-uid-123',
            email: 'jane@example.com',
          },
        }),
      });

      const result = await adapter.authenticate(makeRequest('__session=valid'));
      expect(result).toMatchObject({ matched: true });
      if ('user' in result) {
        expect(result.user.id).toBe('fb-uid-123');
        expect(result.user.email).toBe('jane@example.com');
      }
    });

    it('wraps unknown resolver failures in FirebaseAuthException', async () => {
      const adapter = await makeAdapter({
        verifier: new StubVerifier({
          kind: 'resolve',
          token: { uid: 'u-1', sub: 'u-1' },
        }),
        resolver: new ExplodingResolver(),
      });

      const result = await adapter.authenticate(makeRequest('__session=valid'));
      expect(result).toMatchObject({ matched: true });
      if ('error' in result) {
        expect(result.error).toBeInstanceOf(FirebaseAuthException);
      }
    });
  });
});
