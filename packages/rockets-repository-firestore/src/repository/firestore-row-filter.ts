import type { FirestoreQueryFilter } from '../interfaces/firestore-query.interface';
import {
  compareFirestoreValues,
  firestoreValuesEqual,
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
  const value = row[filter.field];
  switch (filter.op) {
    case '==':
      return firestoreValuesEqual(value, filter.value);
    case '!=':
      return !firestoreValuesEqual(value, filter.value);
    case '<':
      return compareFirestoreValues(value, filter.value) < 0;
    case '<=':
      return compareFirestoreValues(value, filter.value) <= 0;
    case '>':
      return compareFirestoreValues(value, filter.value) > 0;
    case '>=':
      return compareFirestoreValues(value, filter.value) >= 0;
    case 'in':
      return (
        Array.isArray(filter.value) &&
        filter.value.some((candidate) => firestoreValuesEqual(value, candidate))
      );
    case 'not-in':
      return (
        Array.isArray(filter.value) &&
        !filter.value.some((candidate) =>
          firestoreValuesEqual(value, candidate),
        )
      );
    case 'array-contains':
      return (
        Array.isArray(value) &&
        value.some((candidate) => firestoreValuesEqual(candidate, filter.value))
      );
    default: {
      const exhaustive: never = filter.op;
      return exhaustive;
    }
  }
}
