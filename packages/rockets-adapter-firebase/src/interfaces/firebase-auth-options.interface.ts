import { ModuleMetadata, Type } from '@nestjs/common';

import { FirebaseTokenVerifierInterface } from './firebase-token-verifier.interface';
import { FirebaseUserResolverInterface } from './firebase-user-resolver.interface';

/**
 * Options accepted by `FirebaseAuthModule.forRoot()` /
 * `forRootAsync()`.
 *
 * Two ways to supply the verifier:
 * 1. **`firebaseApp`** — an initialized `admin.app.App` instance from
 *    `firebase-admin`. The module wraps it with the default
 *    `FirebaseTokenVerifierService`. This is the common case.
 * 2. **`verifier`** — your own class implementing
 *    `FirebaseTokenVerifierInterface`. Use this when you already manage
 *    firebase-admin lifecycle elsewhere or want to swap the SDK for
 *    custom logic (e.g. token cache, multi-project router).
 */
export interface FirebaseAuthModuleOptions
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * An initialized firebase-admin app. Required when `verifier` is not
   * provided. Typed loosely (`unknown`) so this package does NOT pull
   * `firebase-admin` types at compile time — it's an optional peer dep.
   */
  readonly firebaseApp?: unknown;
  /**
   * Custom verifier implementation. Takes precedence over
   * `firebaseApp` when both are supplied.
   */
  readonly verifier?: Type<FirebaseTokenVerifierInterface>;
  /**
   * Custom user resolver. When omitted, the default resolver returns
   * the claims directly from the Firebase token (uid, email, name,
   * roles if present in custom claims).
   */
  readonly userResolver?: Type<FirebaseUserResolverInterface>;
  /**
   * When true (default false), the verifier asks Firebase whether the
   * token has been revoked on every request. Adds a network round-trip
   * — only enable for high-security flows.
   */
  readonly checkRevoked?: boolean;
  /**
   * Opts into session-cookie auth (issue #58): when set,
   * `FirebaseAuthModule` additionally registers `FirebaseSessionCookieAdapter`
   * in the exported provider set (add it to the app's own `auth` chain
   * alongside — or instead of — the bearer `FirebaseAuthAdapter`).
   * Omit this to keep a bearer-only app completely unaffected — no
   * session adapter is registered, no session-cookie code path runs.
   */
  readonly sessionCookie?: FirebaseSessionCookieConfig;
}

export interface FirebaseSessionCookieConfig {
  /**
   * Cookie name the adapter reads. Defaults to `'__session'` — the
   * name Firebase Hosting's own reverse proxy also recognises.
   */
  readonly cookieName?: string;
  /**
   * Whether every request asks Firebase if the session cookie has been
   * revoked — which is also the check that catches a DISABLED user.
   *
   * **Defaults to `true`, deliberately unlike the bearer
   * `checkRevoked` above.** The two credentials have different blast
   * radii, so they get different defaults rather than one default
   * applied for symmetry: a Firebase ID token expires in an hour, so a
   * revocation missed by a bearer request is wrong for at most that
   * long, and paying a network round-trip per request to shrink an hour
   * is a real cost for a small win. A session cookie lives up to
   * **14 days**. Defaulting it to `false` means "signed out on all
   * devices", "account disabled", and "credentials rotated after a
   * breach" do nothing to an attacker holding the cookie, for two
   * weeks. That is not a default anyone would knowingly choose, so it
   * is not the one they get by omission.
   *
   * Set it to `false` only with a deliberate reason — a short
   * `expiresIn` at mint time, or revocation enforced elsewhere.
   */
  readonly checkRevoked?: boolean;
}
