import { createHash } from 'node:crypto';

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
    throw new Error(
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
  if (value.length > 1500) {
    return false;
  }
  if (value.includes('/') || value.includes('..')) {
    return false;
  }
  return true;
}
