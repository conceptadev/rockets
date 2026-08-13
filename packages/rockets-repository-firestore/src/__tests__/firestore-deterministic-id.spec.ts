import { describe, expect, it } from 'vitest';

import { FirestoreInvalidDocumentIdException } from '../exceptions/firestore-invalid-document-id.exception';
import { deriveFirestoreDocumentId } from '../utils/firestore-deterministic-id';

describe('deriveFirestoreDocumentId', () => {
  it('passes through a safe document id', () => {
    expect(deriveFirestoreDocumentId('user-123')).toBe('user-123');
  });

  it('rejects empty / non-string values', () => {
    expect(() => deriveFirestoreDocumentId('')).toThrow(
      FirestoreInvalidDocumentIdException,
    );
    expect(() => deriveFirestoreDocumentId('   ')).toThrow(
      FirestoreInvalidDocumentIdException,
    );
    expect(() => deriveFirestoreDocumentId(42)).toThrow(
      FirestoreInvalidDocumentIdException,
    );
  });

  it('hashes ids that contain /', () => {
    const id = deriveFirestoreDocumentId('a/b');
    expect(id).toMatch(/^u_[a-f0-9]{64}$/);
    expect(id).not.toContain('/');
  });

  it('hashes "." and ".."', () => {
    expect(deriveFirestoreDocumentId('.')).toMatch(/^u_[a-f0-9]{64}$/);
    expect(deriveFirestoreDocumentId('..')).toMatch(/^u_[a-f0-9]{64}$/);
  });

  it('hashes reserved __*__ names', () => {
    expect(deriveFirestoreDocumentId('__name__')).toMatch(/^u_[a-f0-9]{64}$/);
  });

  it('hashes values longer than 1500 UTF-8 bytes', () => {
    // "é" is 2 bytes in UTF-8; 800 chars → 1600 bytes.
    const oversized = 'é'.repeat(800);
    expect(Buffer.byteLength(oversized, 'utf8')).toBeGreaterThan(1500);
    expect(deriveFirestoreDocumentId(oversized)).toMatch(/^u_[a-f0-9]{64}$/);
  });
});
