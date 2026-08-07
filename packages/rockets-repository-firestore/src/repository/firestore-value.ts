/** Compare scalar values using the semantics shared by local filtering and sorting. */
export function compareFirestoreValues(left: unknown, right: unknown): number {
  const a = toComparable(left);
  const b = toComparable(right);

  if (a === b) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return a < b ? -1 : 1;
}

/** Firestore dates compare by value rather than JavaScript object identity. */
export function firestoreValuesEqual(left: unknown, right: unknown): boolean {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }
  return Object.is(left, right);
}

function toComparable(value: unknown): number | string | undefined {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  return undefined;
}
