import { createHash } from 'node:crypto';

import { FirestoreInvalidDocumentIdException } from '../exceptions/firestore-invalid-document-id.exception';

/**
 * Derive a Firestore document id from a single unique field value.
 *
 * Prefer the raw string when it is a safe document id; otherwise hash.
 */
export function deriveFirestoreDocumentId(
  value: unknown,
  options?: { readonly hashPrefix?: string },
): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new FirestoreInvalidDocumentIdException(
      'Firestore uniqueDocumentIdField must be a non-empty string on create',
    );
  }
  const trimmed = value.trim();
  if (isSafeFirestoreDocumentId(trimmed)) {
    return trimmed;
  }
  const prefix = options?.hashPrefix ?? 'u';
  const digest = createHash('sha256').update(trimmed).digest('hex');
  return `${prefix}_${digest}`;
}

function isSafeFirestoreDocumentId(value: string): boolean {
  if (Buffer.byteLength(value, 'utf8') > 1500) {
    return false;
  }
  if (value === '.' || value === '..') {
    return false;
  }
  if (value.includes('/')) {
    return false;
  }
  if (/^__.*__$/.test(value)) {
    return false;
  }
  return true;
}
