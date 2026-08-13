import { describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase-admin/firestore';

import { FirestoreInvalidPreconditionException } from '../exceptions/firestore-invalid-precondition.exception';
import { toAdminPrecondition } from '../utils/firestore-precondition.util';

describe('toAdminPrecondition', () => {
  it('returns undefined when no precondition is provided', () => {
    expect(toAdminPrecondition(undefined)).toBeUndefined();
  });

  it('maps exists: true', () => {
    expect(toAdminPrecondition({ exists: true })).toEqual({ exists: true });
  });

  it('maps lastUpdateTime to a Timestamp', () => {
    const when = new Date('2024-01-02T03:04:05.000Z');
    const result = toAdminPrecondition({ lastUpdateTime: when });
    expect(result?.lastUpdateTime).toBeInstanceOf(Timestamp);
    expect(result?.lastUpdateTime?.toDate()).toEqual(when);
  });

  it('rejects exists and lastUpdateTime together', () => {
    expect(() =>
      toAdminPrecondition({
        exists: true,
        lastUpdateTime: new Date(),
      }),
    ).toThrow(FirestoreInvalidPreconditionException);
  });

  it('rejects exists: false on set/update', () => {
    expect(() => toAdminPrecondition({ exists: false }, 'set')).toThrow(
      FirestoreInvalidPreconditionException,
    );
  });

  it('allows exists: false on delete', () => {
    expect(toAdminPrecondition({ exists: false }, 'delete')).toEqual({
      exists: false,
    });
  });
});
