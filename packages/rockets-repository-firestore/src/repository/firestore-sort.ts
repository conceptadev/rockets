import type { FirestoreOrderBy } from '../interfaces/firestore-query.interface';
import { compareFirestoreValues } from './firestore-value';

/** Sort rows by every declared clause, in order, so later clauses break ties. */
export function sortFirestoreRows(
  rows: readonly Record<string, unknown>[],
  orderBy?: readonly FirestoreOrderBy[],
): Record<string, unknown>[] {
  if (!orderBy || orderBy.length === 0) return [...rows];

  return [...rows].sort((left, right) => {
    for (const clause of orderBy) {
      const leftValue = left[clause.field];
      const rightValue = right[clause.field];
      const leftMissing = leftValue === undefined || leftValue === null;
      const rightMissing = rightValue === undefined || rightValue === null;
      if (leftMissing || rightMissing) {
        if (leftMissing && rightMissing) continue;
        return leftMissing ? 1 : -1;
      }
      const result = compareFirestoreValues(leftValue, rightValue);
      if (result !== 0) {
        return clause.direction === 'desc' ? -result : result;
      }
    }
    return 0;
  });
}
