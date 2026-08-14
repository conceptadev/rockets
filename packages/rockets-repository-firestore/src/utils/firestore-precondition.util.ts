import { Timestamp, type Precondition } from 'firebase-admin/firestore';

import { FirestoreInvalidPreconditionException } from '../exceptions/firestore-invalid-precondition.exception';
import type { FirestoreWritePrecondition } from '../interfaces/firestore-write.interface';

/**
 * Normalize a write precondition for the Admin SDK.
 *
 * A set/update with a precondition uses update semantics (document must
 * exist). Combining `exists` with `lastUpdateTime` is rejected by Firestore.
 * `exists: false` is legal on delete only.
 */
export function toAdminPrecondition(
  precondition: FirestoreWritePrecondition | undefined,
  mode: 'set' | 'delete' = 'set',
): Precondition | undefined {
  if (precondition === undefined) {
    return undefined;
  }
  if (
    precondition.lastUpdateTime !== undefined &&
    precondition.exists !== undefined
  ) {
    throw new FirestoreInvalidPreconditionException(
      'Firestore precondition cannot set both lastUpdateTime and exists',
    );
  }
  if (precondition.exists === false) {
    if (mode === 'set') {
      throw new FirestoreInvalidPreconditionException(
        'Firestore set/update precondition cannot require exists: false — use create()',
      );
    }
    return { exists: false };
  }
  if (precondition.lastUpdateTime !== undefined) {
    return {
      lastUpdateTime: Timestamp.fromDate(precondition.lastUpdateTime),
    };
  }
  if (precondition.exists === true) {
    return { exists: true };
  }
  return undefined;
}
