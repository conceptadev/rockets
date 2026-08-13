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
 * Firestore requires the first orderBy to be the inequality / range field.
 * Prepend or promote that field; flag when local re-sort is required.
 */
export function reconcileOrderByWithInequality(
  branch: FirestoreQueryBranch,
  orderBy: readonly FirestoreOrderBy[] | undefined,
): ReconciledOrderBy {
  const inequalityField = findInequalityField(branch);
  if (inequalityField === undefined) {
    return { serverOrderBy: orderBy, clientReorder: false };
  }

  const requested = orderBy ?? [];
  if (requested.length === 0) {
    return {
      serverOrderBy: [{ field: inequalityField, direction: 'asc' }],
      clientReorder: false,
    };
  }

  const first = requested[0];
  if (first !== undefined && first.field === inequalityField) {
    return { serverOrderBy: requested, clientReorder: false };
  }

  const withoutDup = requested.filter(
    (clause) => clause.field !== inequalityField,
  );
  const promoted: FirestoreOrderBy = {
    field: inequalityField,
    direction: 'asc',
  };
  return {
    serverOrderBy: [promoted, ...withoutDup],
    clientReorder: true,
  };
}

function findInequalityField(branch: FirestoreQueryBranch): string | undefined {
  for (const filter of branch.filters) {
    if (INEQUALITY_OPS.has(filter.op)) {
      return filter.field;
    }
  }
  return undefined;
}
