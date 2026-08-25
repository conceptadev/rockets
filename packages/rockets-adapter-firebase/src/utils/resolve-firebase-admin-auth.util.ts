import { getAuth } from 'firebase-admin/auth';

import { FirebaseAuthConfigurationException } from '../exceptions/firebase-auth-configuration.exception';

export interface FirebaseAdminAuth {
  verifyIdToken(
    token: string,
    checkRevoked?: boolean,
  ): Promise<Record<string, unknown> & { uid: string }>;
  /**
   * Session-cookie capability (issue #58) — same shape as
   * `verifyIdToken`, narrowed the same way rather than pulling the full
   * `firebase-admin` `Auth` type.
   */
  verifySessionCookie(
    sessionCookie: string,
    checkRevoked?: boolean,
  ): Promise<Record<string, unknown> & { uid: string }>;
  createSessionCookie(
    idToken: string,
    sessionCookieOptions: { expiresIn: number },
  ): Promise<string>;
}

interface FirebaseAdminAppLegacy {
  auth(): FirebaseAdminAuth;
}

/**
 * Legacy `admin.app.App` exposes `.auth()`; modular apps from
 * `firebase-admin/app` require `getAuth(app)` from `firebase-admin/auth`.
 */
export function resolveFirebaseAdminAuth(
  firebaseApp: unknown,
): FirebaseAdminAuth {
  const legacy = firebaseApp as FirebaseAdminAppLegacy;
  if (typeof legacy.auth === 'function') {
    return legacy.auth();
  }
  try {
    return getAuth(firebaseApp as Parameters<typeof getAuth>[0]);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown Firebase app error';
    throw new FirebaseAuthConfigurationException(
      `Firebase app is not a usable Firebase Admin auth app: ${message}`,
    );
  }
}
