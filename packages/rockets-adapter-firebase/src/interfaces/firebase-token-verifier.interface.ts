import { FirebaseDecodedTokenInterface } from './firebase-decoded-token.interface';

/**
 * Abstraction over `admin.auth().verifyIdToken()`. The real
 * implementation is `FirebaseTokenVerifierService` which wraps the
 * firebase-admin SDK; tests inject mocks via
 * `FIREBASE_TOKEN_VERIFIER_TOKEN`.
 */
export interface FirebaseTokenVerifierInterface {
  /**
   * Verify a Firebase ID token. Implementations MUST throw when:
   * - the token signature is invalid;
   * - the token is expired;
   * - the token is for a project the verifier was not initialized with;
   * - `checkRevoked` is enabled and the user was disabled/revoked.
   */
  verifyIdToken(
    token: string,
    options?: FirebaseVerifyOptions,
  ): Promise<FirebaseDecodedTokenInterface>;
}

export interface FirebaseVerifyOptions {
  /** When true, the verifier checks the token has not been revoked. */
  readonly checkRevoked?: boolean;
}

/**
 * Session-cookie capability (issue #58) — deliberately a SEPARATE
 * interface from {@link FirebaseTokenVerifierInterface}, not two more
 * required methods on it. A bearer-only custom `verifier` (the `verifier`
 * module option) implements only the base interface today; forcing
 * session-cookie methods onto it would break every existing bearer-only
 * verifier at compile time the moment this shipped. The default
 * `FirebaseTokenVerifierService` implements BOTH — session-cookie support
 * only activates when an app opts in via `sessionCookie` module options.
 */
export interface FirebaseSessionCookieVerifierInterface {
  /**
   * Verify a Firebase SESSION COOKIE — the browser-cookie counterpart to
   * `verifyIdToken`. Same failure contract.
   */
  verifySessionCookie(
    sessionCookie: string,
    options?: FirebaseVerifyOptions,
  ): Promise<FirebaseDecodedTokenInterface>;

  /**
   * Mints a session cookie from a freshly-verified ID token — the client
   * exchanges its ID token for this ONCE, right after sign-in (the
   * "cookie minting" the field report found entirely missing). The
   * caller sets it as an httpOnly, Secure cookie on the response; this
   * method only produces the string value. See `CONFIGURATION.md` §7c.
   */
  createSessionCookie(
    idToken: string,
    options: FirebaseSessionCookieOptions,
  ): Promise<string>;
}

export interface FirebaseSessionCookieOptions {
  /** Cookie lifetime in milliseconds. Firebase caps this at 14 days. */
  readonly expiresIn: number;
}
