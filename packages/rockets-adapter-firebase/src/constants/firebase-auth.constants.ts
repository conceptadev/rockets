export const FIREBASE_TOKEN_VERIFIER_TOKEN = Symbol(
  '__FIREBASE_TOKEN_VERIFIER_TOKEN__',
);

export const FIREBASE_USER_RESOLVER_TOKEN = Symbol(
  '__FIREBASE_USER_RESOLVER_TOKEN__',
);

export const FIREBASE_AUTH_MODULE_OPTIONS_TOKEN = Symbol(
  '__FIREBASE_AUTH_MODULE_OPTIONS_TOKEN__',
);

/**
 * Resolves the SAME verifier instance as `FIREBASE_TOKEN_VERIFIER_TOKEN`,
 * typed for the session-cookie capability (issue #58). Only bound when
 * `FirebaseAuthModule` is configured with `sessionCookie`.
 */
export const FIREBASE_SESSION_COOKIE_VERIFIER_TOKEN = Symbol(
  '__FIREBASE_SESSION_COOKIE_VERIFIER_TOKEN__',
);
