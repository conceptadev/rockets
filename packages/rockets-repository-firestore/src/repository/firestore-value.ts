export interface FirestoreFieldValue {
  readonly exists: boolean;
  readonly value: unknown;
}

/** Read a dotted Firestore field path while preserving missing-vs-null. */
export function readFirestoreField(
  row: Record<string, unknown>,
  field: string,
): FirestoreFieldValue {
  let current: unknown = row;
  for (const segment of field.split('.')) {
    if (
      !isPlainMap(current) ||
      !Object.prototype.hasOwnProperty.call(current, segment)
    ) {
      return { exists: false, value: undefined };
    }
    current = current[segment];
    if (current === undefined) return { exists: false, value: undefined };
  }
  return { exists: true, value: current };
}

/** Compare values in the scalar subset supported by local ordering. */
export function compareFirestoreValues(left: unknown, right: unknown): number {
  const a = sortable(left);
  const b = sortable(right);
  if (!a || !b) {
    throw new Error(
      `Firestore local ordering supports only null, boolean, number, timestamp, and string values; received ${describeValue(
        !a ? left : right,
      )}.`,
    );
  }
  if (a.rank !== b.rank) return a.rank < b.rank ? -1 : 1;
  if (a.value === b.value) return 0;
  return a.value < b.value ? -1 : 1;
}

/** Structural equality for Firestore values used by local query paths. */
export function firestoreValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (isEqualValue(left)) return left.isEqual(right);
  if (isEqualValue(right)) return right.isEqual(left);

  const leftDate = asDate(left);
  const rightDate = asDate(right);
  if (leftDate && rightDate) return leftDate.getTime() === rightDate.getTime();

  if (isBytes(left) && isBytes(right)) {
    if (left.byteLength !== right.byteLength) return false;
    return left.every((value, index) => value === right[index]);
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((value, index) => firestoreValuesEqual(value, right[index]))
    );
  }
  if (isPlainMap(left) && isPlainMap(right)) {
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every(
        (key, index) =>
          key === rightKeys[index] &&
          firestoreValuesEqual(left[key], right[key]),
      )
    );
  }
  return false;
}

/** Recursively convert Firestore timestamp-like SDK values to Date. */
export function normalizeFirestoreValue(value: unknown): unknown {
  const date = asDate(value);
  if (date) return date;
  if (Array.isArray(value)) return value.map(normalizeFirestoreValue);
  if (isPlainMap(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        normalizeFirestoreValue(child),
      ]),
    );
  }
  return value;
}

export function sameFirestoreRangeType(left: unknown, right: unknown): boolean {
  return (
    scalarKind(left) !== undefined && scalarKind(left) === scalarKind(right)
  );
}

function sortable(
  value: unknown,
): { rank: number; value: number | string } | undefined {
  if (value === null) return { rank: 0, value: 0 };
  if (typeof value === 'boolean') return { rank: 1, value: value ? 1 : 0 };
  if (typeof value === 'number') return { rank: 2, value };
  const date = asDate(value);
  if (date) return { rank: 3, value: date.getTime() };
  if (typeof value === 'string') return { rank: 4, value };
  return undefined;
}

function scalarKind(value: unknown): string | undefined {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (asDate(value)) return 'timestamp';
  if (typeof value === 'string') return 'string';
  return undefined;
}

function asDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    const date = value.toDate();
    return date instanceof Date ? date : undefined;
  }
  return undefined;
}

function isPlainMap(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isBytes(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array;
}

function isEqualValue(
  value: unknown,
): value is { isEqual(other: unknown): boolean } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'isEqual' in value &&
    typeof value.isEqual === 'function'
  );
}

function describeValue(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}
