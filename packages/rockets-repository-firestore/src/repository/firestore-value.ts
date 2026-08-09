export type FirestoreFieldValue =
  | { readonly exists: false; readonly value: undefined }
  | { readonly exists: true; readonly value: unknown };

type SortableFirestoreValue = {
  readonly rank: number;
  readonly kind:
    | 'null'
    | 'boolean'
    | 'number'
    | 'timestamp'
    | 'string'
    | 'bytes'
    | 'reference'
    | 'geopoint'
    | 'array'
    | 'vector'
    | 'map';
  readonly value: unknown;
};

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

export function hasNonNullFirestoreValue(
  field: FirestoreFieldValue,
): field is { readonly exists: true; readonly value: {} } {
  return field.exists && field.value !== null;
}

/** Compare values using Firestore's total type and within-type ordering. */
export function compareFirestoreValues(
  left: unknown,
  right: unknown,
  field?: string,
): number {
  const a = sortable(left);
  const b = sortable(right);
  if (!a || !b) {
    const context = field ? ` for field "${field}"` : '';
    throw new Error(
      `Firestore local ordering${context} does not support ${describeValue(
        !a ? left : right,
      )} values.`,
    );
  }
  if (a.rank !== b.rank) return a.rank < b.rank ? -1 : 1;

  switch (a.kind) {
    case 'null':
      return 0;
    case 'boolean':
    case 'number':
    case 'timestamp':
      return compareNumbers(a.value as number, b.value as number);
    case 'string':
      return compareStrings(a.value as string, b.value as string);
    case 'bytes':
      return compareSequences(
        a.value as Uint8Array,
        b.value as Uint8Array,
        compareNumbers,
      );
    case 'reference':
      return compareSequences(
        a.value as readonly string[],
        b.value as readonly string[],
        compareStrings,
      );
    case 'geopoint':
      return compareSequences(
        a.value as readonly number[],
        b.value as readonly number[],
        compareNumbers,
      );
    case 'array':
      return compareSequences(
        a.value as readonly unknown[],
        b.value as readonly unknown[],
        (leftValue, rightValue) =>
          compareFirestoreValues(leftValue, rightValue, field),
      );
    case 'vector': {
      const leftVector = a.value as readonly number[];
      const rightVector = b.value as readonly number[];
      const dimensionOrder = compareNumbers(
        leftVector.length,
        rightVector.length,
      );
      return dimensionOrder === 0
        ? compareSequences(leftVector, rightVector, compareNumbers)
        : dimensionOrder;
    }
    case 'map':
      return compareMaps(
        a.value as Record<string, unknown>,
        b.value as Record<string, unknown>,
        field,
      );
  }
}

/** Structural equality for Firestore values used by local query paths. */
export function firestoreValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;

  const leftDate = asDate(left);
  const rightDate = asDate(right);
  if (leftDate || rightDate) {
    if (leftDate && rightDate) {
      return leftDate.getTime() === rightDate.getTime();
    }
    if (isEqualValue(left) && isEqualValue(right)) {
      return left.isEqual(right);
    }
    return false;
  }

  if (isEqualValue(left)) return left.isEqual(right);
  if (isEqualValue(right)) return right.isEqual(left);

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
  const leftKind = scalarKind(left);
  return leftKind !== undefined && leftKind === scalarKind(right);
}

function sortable(value: unknown): SortableFirestoreValue | undefined {
  if (value === null) return { rank: 0, kind: 'null', value: 0 };
  if (typeof value === 'boolean') {
    return { rank: 1, kind: 'boolean', value: value ? 1 : 0 };
  }
  if (typeof value === 'number') {
    return { rank: 2, kind: 'number', value };
  }
  const date = asDate(value);
  if (date) return { rank: 3, kind: 'timestamp', value: date.getTime() };
  if (typeof value === 'string') {
    return { rank: 4, kind: 'string', value };
  }
  if (isBytes(value)) return { rank: 5, kind: 'bytes', value };
  if (isDocumentReference(value)) {
    return { rank: 6, kind: 'reference', value: value.path.split('/') };
  }
  if (isGeoPoint(value)) {
    return {
      rank: 7,
      kind: 'geopoint',
      value: [value.latitude, value.longitude],
    };
  }
  if (Array.isArray(value)) return { rank: 8, kind: 'array', value };
  if (isVectorValue(value)) {
    return { rank: 9, kind: 'vector', value: value.toArray() };
  }
  if (isPlainMap(value)) return { rank: 10, kind: 'map', value };
  return undefined;
}

function compareMaps(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
  field?: string,
): number {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  const commonLength = Math.min(leftKeys.length, rightKeys.length);

  for (let index = 0; index < commonLength; index += 1) {
    const leftKey = leftKeys[index]!;
    const rightKey = rightKeys[index]!;
    const keyOrder = compareStrings(leftKey, rightKey);
    if (keyOrder !== 0) return keyOrder;
    const valueOrder = compareFirestoreValues(
      left[leftKey],
      right[rightKey],
      field,
    );
    if (valueOrder !== 0) return valueOrder;
  }

  return compareNumbers(leftKeys.length, rightKeys.length);
}

function compareSequences<T>(
  left: ArrayLike<T>,
  right: ArrayLike<T>,
  compare: (leftValue: T, rightValue: T) => number,
): number {
  const commonLength = Math.min(left.length, right.length);
  for (let index = 0; index < commonLength; index += 1) {
    const result = compare(left[index]!, right[index]!);
    if (result !== 0) return result;
  }
  return compareNumbers(left.length, right.length);
}

function compareNumbers(left: number, right: number): number {
  const leftNaN = Number.isNaN(left);
  const rightNaN = Number.isNaN(right);
  if (leftNaN || rightNaN) {
    if (leftNaN && rightNaN) return 0;
    return leftNaN ? -1 : 1;
  }
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function compareStrings(left: string, right: string): number {
  if (left === right) return 0;
  return left < right ? -1 : 1;
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

function isDocumentReference(
  value: unknown,
): value is { readonly path: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    !isPlainMap(value) &&
    'path' in value &&
    typeof value.path === 'string'
  );
}

function isGeoPoint(
  value: unknown,
): value is { readonly latitude: number; readonly longitude: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    !isPlainMap(value) &&
    'latitude' in value &&
    typeof value.latitude === 'number' &&
    'longitude' in value &&
    typeof value.longitude === 'number'
  );
}

function isVectorValue(
  value: unknown,
): value is { toArray(): readonly number[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    !isPlainMap(value) &&
    'toArray' in value &&
    typeof value.toArray === 'function'
  );
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
