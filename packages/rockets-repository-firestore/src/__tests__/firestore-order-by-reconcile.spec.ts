import { describe, expect, it } from 'vitest';

import { reconcileOrderByWithInequality } from '../repository/firestore-order-by-reconcile';

describe('reconcileOrderByWithInequality', () => {
  it('prepends the inequality field when orderBy starts elsewhere', () => {
    const result = reconcileOrderByWithInequality(
      {
        filters: [{ field: 'expiresAt', op: '<', value: new Date() }],
        postFilters: [],
      },
      [{ field: 'name', direction: 'asc' }],
    );

    expect(result.serverOrderBy).toEqual([
      { field: 'expiresAt', direction: 'asc' },
      { field: 'name', direction: 'asc' },
    ]);
    expect(result.clientReorder).toBe(true);
  });

  it('leaves orderBy alone when the inequality field is already first', () => {
    const result = reconcileOrderByWithInequality(
      {
        filters: [{ field: 'expiresAt', op: '>', value: new Date() }],
        postFilters: [],
      },
      [
        { field: 'expiresAt', direction: 'desc' },
        { field: 'name', direction: 'asc' },
      ],
    );

    expect(result.clientReorder).toBe(false);
    expect(result.serverOrderBy?.[0]?.field).toBe('expiresAt');
  });

  it('injects inequality orderBy when the caller omitted order', () => {
    const result = reconcileOrderByWithInequality(
      {
        filters: [{ field: 'score', op: '!=', value: null }],
        postFilters: [],
      },
      undefined,
    );

    expect(result.serverOrderBy).toEqual([
      { field: 'score', direction: 'asc' },
    ]);
    expect(result.clientReorder).toBe(false);
  });
});
