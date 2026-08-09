import { describe, it, expect } from 'vitest';
import { FirebaseAuthAdapter } from '../adapters/firebase-auth.adapter';
import { defineFirebaseAuth } from '../integration/define-firebase-auth';
import { FirebaseAuthModule } from '../modules/firebase-auth.module';
import { FirebaseTokenVerifierInterface } from '../interfaces/firebase-token-verifier.interface';
import { FirebaseDecodedTokenInterface } from '../interfaces/firebase-decoded-token.interface';

class FakeVerifier implements FirebaseTokenVerifierInterface {
  async verifyIdToken(): Promise<FirebaseDecodedTokenInterface> {
    return { uid: 'fake', sub: 'fake' };
  }
}

describe('defineFirebaseAuth', () => {
  it('returns AuthBootstrap with FirebaseAuthAdapter and forRoot (sync path)', () => {
    const bootstrap = defineFirebaseAuth({
      verifier: FakeVerifier,
    });

    expect(bootstrap.adapter).toBe(FirebaseAuthAdapter);
    expect(bootstrap.forRoot).toBeDefined();

    const dynamicModule = bootstrap.forRoot!();
    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.module).toBe(FirebaseAuthModule);
  });

  it('accepts async options and forwards them to FirebaseAuthModule.forRootAsync', () => {
    const bootstrap = defineFirebaseAuth({
      forRootAsync: {
        useFactory: () => ({ verifier: FakeVerifier }),
      },
    });

    expect(bootstrap.adapter).toBe(FirebaseAuthAdapter);
    const dynamicModule = bootstrap.forRoot!();
    expect(dynamicModule.module).toBe(FirebaseAuthModule);
  });

  it('accepts every sync option, including the inherited `imports`', () => {
    class SyncSideModule {}

    const bootstrap = defineFirebaseAuth({
      verifier: FakeVerifier,
      imports: [SyncSideModule],
    });

    expect(bootstrap.forRoot!().module).toBe(FirebaseAuthModule);
  });

  it('rejects sync options alongside `forRootAsync`', () => {
    // `forRoot()` only forwards `input.forRootAsync`, so a sync key here would
    // be silently dropped. The exclusion is derived from
    // `keyof FirebaseAuthModuleOptions`, so it covers the inherited `imports`
    // too — these two directives fail the build if that hole ever reopens.
    // @ts-expect-error `imports` belongs to the sync branch
    defineFirebaseAuth({
      forRootAsync: { useFactory: () => ({ verifier: FakeVerifier }) },
      imports: [class AsyncSideModule {}],
    });

    // @ts-expect-error `verifier` belongs to the sync branch
    defineFirebaseAuth({
      forRootAsync: { useFactory: () => ({ verifier: FakeVerifier }) },
      verifier: FakeVerifier,
    });

    expect(true).toBe(true);
  });
});
