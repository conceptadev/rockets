import type { FirestoreOrderBy } from '../interfaces/firestore-query.interface';
import { compareFirestoreValues, readFirestoreField } from './firestore-value';

/** Sort rows by every declared clause, in order, so later clauses break ties. */
export function sortFirestoreRows(
  rows: readonly Record<string, unknown>[],
  orderBy?: readonly FirestoreOrderBy[],
): Record<string, unknown>[] {
  if (!orderBy || orderBy.length === 0) return [...rows];

  const present = rows.filter((row) =>
    orderBy.every((clause) => readFirestoreField(row, clause.field).exists),
  );

  return present.sort((left, right) => {
    for (const clause of orderBy) {
      const leftValue = readFirestoreField(left, clause.field).value;
      const rightValue = readFirestoreField(right, clause.field).value;
      const result = compareFirestoreValues(
        leftValue,
        rightValue,
        clause.field,
      );
      if (result !== 0) {
        return clause.direction === 'desc' ? -result : result;
      }
    }
    return 0;
  });
}
