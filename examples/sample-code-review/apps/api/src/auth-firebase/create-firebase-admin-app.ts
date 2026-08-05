import { Logger } from '@nestjs/common';
import { join } from 'path';
import type { App } from 'firebase-admin/app';
import { ensureFirebaseAdminApp } from '@conceptadev/rockets-repository-firestore';

const logger = new Logger('FirebaseAdmin');

/** `apps/api` package root — valid from `src/` (dev) and `dist/` (build). */
const API_PACKAGE_ROOT = join(__dirname, '..', '..');

/**
 * Returns the shared Firebase Admin singleton (auth + Firestore).
 * Delegates to `@conceptadev/rockets-repository-firestore` so path/env rules stay in one place.
 */
export function createFirebaseAdminApp(): App {
  const app = ensureFirebaseAdminApp(API_PACKAGE_ROOT);
  logger.log('Firebase Admin ready (shared singleton)');
  return app;
}
