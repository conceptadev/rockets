/**
 * Sentinel for Admin `FieldValue.increment(delta)`.
 *
 * Pass through repository patches / backend `set` data; Admin serialises to
 * the native FieldValue, InMemory applies the delta numerically.
 */
export type FirestoreIncrementSentinel = {
  readonly __firestoreIncrement: number;
};

export function firestoreIncrement(delta: number): FirestoreIncrementSentinel {
  return { __firestoreIncrement: delta };
}

export function isFirestoreIncrementSentinel(
  value: unknown,
): value is FirestoreIncrementSentinel {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__firestoreIncrement' in value &&
    typeof (value as FirestoreIncrementSentinel).__firestoreIncrement ===
      'number'
  );
}

/**
 * Optional write precondition (Admin `Precondition`).
 *
 * Prefer transactions for contended leases; this is the non-transactional
 * CAS path for heartbeats and simple counters.
 */
export interface FirestoreWritePrecondition {
  readonly lastUpdateTime?: Date;
  readonly exists?: boolean;
}
