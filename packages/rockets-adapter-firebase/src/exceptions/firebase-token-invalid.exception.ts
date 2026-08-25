import { FirebaseAuthException } from './firebase-auth.exception';

export class FirebaseTokenInvalidException extends FirebaseAuthException {
  constructor(cause?: unknown) {
    super('Firebase ID token is invalid or expired', cause);
  }
}

export class FirebaseTokenRevokedException extends FirebaseAuthException {
  constructor(cause?: unknown) {
    super('Firebase ID token has been revoked', cause);
  }
}

export class FirebaseTokenMissingSubjectException extends FirebaseAuthException {
  constructor() {
    super('Firebase ID token is missing the `sub`/`uid` claim');
  }
}

/**
 * Session-cookie counterparts (issue #58) — same failure semantics as
 * the ID-token exceptions above, worded for the cookie flow so a
 * verification failure log doesn't say "ID token" for a request that
 * never carried one.
 */
export class FirebaseSessionCookieInvalidException extends FirebaseAuthException {
  constructor(cause?: unknown) {
    super('Firebase session cookie is invalid or expired', cause);
  }
}

export class FirebaseSessionCookieRevokedException extends FirebaseAuthException {
  constructor(cause?: unknown) {
    super('Firebase session cookie has been revoked', cause);
  }
}
