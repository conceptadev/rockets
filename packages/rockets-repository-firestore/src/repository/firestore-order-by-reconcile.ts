import type {
  FirestoreOrderBy,
  FirestoreQueryBranch,
  FirestoreFilterOp,
} from '../interfaces/firestore-query.interface';

const INEQUALITY_OPS: ReadonlySet<FirestoreFilterOp> = new Set([
  '!=',
  '<',
  '<=',
  '>',
  '>=',
]);

export interface ReconciledOrderBy {
  readonly serverOrderBy: readonly FirestoreOrderBy[] | undefined;
  /**
   * True when the server order differs from the caller's requested order —
   * skip/take must not be pushed to the server (pagination would be wrong).
   */
  readonly clientReorder: boolean;
}

/**
 * Firestore requires every inequality / range field to appear in orderBy,
 * with those fields leading. Promote missing ones; flag when local re-sort
 * is required.
 */
export function reconcileOrderByWithInequality(
  branch: FirestoreQueryBranch,
  orderBy: readonly FirestoreOrderBy[] | undefined,
): ReconciledOrderBy {
  const inequalityFields = findInequalityFields(branch);
  if (inequalityFields.length === 0) {
    return { serverOrderBy: orderBy, clientReorder: false };
  }

  const requested = orderBy ?? [];
  if (requested.length === 0) {
    return {
      serverOrderBy: inequalityFields.map((field) => ({
        field,
        direction: 'asc' as const,
      })),
      clientReorder: false,
    };
  }

  // Firestore only requires inequality fields to lead; their relative order
  // among themselves is free. Keep the caller's order when the leading set
  // matches so limit() pushdown stays available.
  const leading = requested
    .slice(0, inequalityFields.length)
    .map((clause) => clause.field);
  const inequalitySet = new Set(inequalityFields);
  const leadingMatch =
    leading.length === inequalityFields.length &&
    leading.every((field) => inequalitySet.has(field)) &&
    inequalityFields.every((field) => leading.includes(field));
  if (leadingMatch) {
    return { serverOrderBy: requested, clientReorder: false };
  }

  const remainder = requested.filter(
    (clause) => !inequalitySet.has(clause.field),
  );
  const promoted: FirestoreOrderBy[] = inequalityFields.map((field) => {
    const existing = requested.find((clause) => clause.field === field);
    return {
      field,
      direction: existing?.direction ?? 'asc',
    };
  });

  return {
    serverOrderBy: [...promoted, ...remainder],
    clientReorder: true,
  };
}

function findInequalityFields(branch: FirestoreQueryBranch): string[] {
  const fields: string[] = [];
  const seen = new Set<string>();
  for (const filter of branch.filters) {
    if (INEQUALITY_OPS.has(filter.op) && !seen.has(filter.field)) {
      seen.add(filter.field);
      fields.push(filter.field);
    }
  }
  return fields;
}
