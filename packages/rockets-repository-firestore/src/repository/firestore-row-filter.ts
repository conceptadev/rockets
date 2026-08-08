import type { FirestoreQueryFilter } from '../interfaces/firestore-query.interface';
import {
  compareFirestoreValues,
  firestoreValuesEqual,
  readFirestoreField,
  sameFirestoreRangeType,
} from './firestore-value';

/** Apply the non-post-filter predicates that Firestore would normally execute. */
export function applyFirestoreFilters(
  rows: readonly Record<string, unknown>[],
  filters: readonly FirestoreQueryFilter[],
): Record<string, unknown>[] {
  if (filters.length === 0) return [...rows];
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
        field.exists &&
        value !== null &&
        !firestoreValuesEqual(value, filter.value)
      );
    case '<':
      return rangeMatch(
        field.exists,
        value,
        filter.value,
        (result) => result < 0,
      );
    case '<=':
      return rangeMatch(
        field.exists,
        value,
        filter.value,
        (result) => result <= 0,
      );
    case '>':
      return rangeMatch(
        field.exists,
        value,
        filter.value,
        (result) => result > 0,
      );
    case '>=':
      return rangeMatch(
        field.exists,
        value,
        filter.value,
        (result) => result >= 0,
      );
    case 'in':
      return (
        field.exists &&
        Array.isArray(filter.value) &&
        filter.value.some((candidate) => firestoreValuesEqual(value, candidate))
      );
    case 'not-in':
      return (
        field.exists &&
        value !== null &&
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
  exists: boolean,
  value: unknown,
  candidate: unknown,
  predicate: (result: number) => boolean,
): boolean {
  return (
    exists &&
    value !== null &&
    candidate !== null &&
    sameFirestoreRangeType(value, candidate) &&
    predicate(compareFirestoreValues(value, candidate))
  );
}
