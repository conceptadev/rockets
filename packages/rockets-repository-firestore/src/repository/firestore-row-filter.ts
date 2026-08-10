import type {
  FirestoreFilterOp,
  FirestoreQueryFilter,
} from '../interfaces/firestore-query.interface';
import {
  compareFirestoreValues,
  firestoreValuesEqual,
  hasNonNullFirestoreValue,
  readFirestoreField,
  sameFirestoreRangeType,
  type FirestoreFieldValue,
} from './firestore-value';

type FirestoreRangeOp = Extract<FirestoreFilterOp, '<' | '<=' | '>' | '>='>;

const RANGE_PREDICATES: Record<FirestoreRangeOp, (result: number) => boolean> =
  {
    '<': (result) => result < 0,
    '<=': (result) => result <= 0,
    '>': (result) => result > 0,
    '>=': (result) => result >= 0,
  };

/** Apply the non-post-filter predicates that Firestore would normally execute. */
export function applyFirestoreFilters(
  rows: readonly Record<string, unknown>[],
  filters: readonly FirestoreQueryFilter[],
): Record<string, unknown>[] {
  return rows.filter((row) => filters.every((filter) => matches(row, filter)));
}

function matches(
  row: Record<string, unknown>,
  filter: FirestoreQueryFilter,
): boolean {
  const field = readFirestoreField(row, filter.field);
  const value = field.value;
  switch (filter.op) {
    case '==':
      return field.exists && firestoreValuesEqual(value, filter.value);
    case '!=':
      return (
        hasNonNullFirestoreValue(field) &&
        !firestoreValuesEqual(value, filter.value)
      );
    case '<':
    case '<=':
    case '>':
    case '>=':
      return rangeMatch(
        field,
        filter.value,
        RANGE_PREDICATES[filter.op],
        filter.field,
      );
    case 'in':
      return (
        field.exists &&
        Array.isArray(filter.value) &&
        filter.value.some((candidate) => firestoreValuesEqual(value, candidate))
      );
    case 'not-in':
      return (
        hasNonNullFirestoreValue(field) &&
        Array.isArray(filter.value) &&
        !filter.value.some((candidate) =>
          firestoreValuesEqual(value, candidate),
        )
      );
    case 'array-contains':
      return (
        field.exists &&
        Array.isArray(value) &&
        value.some((candidate) => firestoreValuesEqual(candidate, filter.value))
      );
    default: {
      const exhaustive: never = filter.op;
      return exhaustive;
    }
  }
}

function rangeMatch(
  field: FirestoreFieldValue,
  candidate: unknown,
  predicate: (result: number) => boolean,
  fieldName: string,
): boolean {
  return (
    hasNonNullFirestoreValue(field) &&
    candidate !== null &&
    sameFirestoreRangeType(field.value, candidate) &&
    predicate(compareFirestoreValues(field.value, candidate, fieldName))
  );
}
