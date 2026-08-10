import { describe, it, expect } from 'vitest';
import { Where } from '@concepta/nestjs-repository';

import {
  translateDnfBranch,
  translateWhereClause,
} from '../repository/firestore-where.translator';

describe('firestore-where.translator', () => {
  it('maps EQ on id to documentId', () => {
    const branch = translateDnfBranch([Where.eq('id', 'doc-1')]);
    expect(branch.documentId).toBe('doc-1');
    expect(branch.filters).toHaveLength(0);
  });

  it('maps scalar comparisons to Firestore filters', () => {
    const branch = translateDnfBranch([Where.gte('score', 10)]);
    expect(branch.filters).toEqual([{ field: 'score', op: '>=', value: 10 }]);
  });

  it('maps IN with at most 30 values', () => {
    const branch = translateDnfBranch([Where.in('status', ['a', 'b'])]);
    expect(branch.filters).toEqual([
      { field: 'status', op: 'in', value: ['a', 'b'] },
    ]);
  });

  it('maps id IN to direct document lookups', () => {
    const branch = translateDnfBranch([Where.in('id', ['doc-1', 'doc-2'])]);

    expect(branch.documentIds).toEqual(['doc-1', 'doc-2']);
    expect(branch.filters).toEqual([]);
  });

  it('rejects empty and non-string document ids', () => {
    expect(() => translateDnfBranch([Where.eq('id', '')])).toThrow(
      /non-empty string/,
    );
    expect(() => translateDnfBranch([Where.eq('id', null)])).toThrow(
      /non-empty string/,
    );
    expect(() => translateDnfBranch([Where.in('id', [''])])).toThrow(
      /non-empty string/,
    );
  });

  it('accepts id lists beyond the batch-write cap (backends chunk reads)', () => {
    const ids = Array.from({ length: 800 }, (_, index) => `doc-${index}`);

    const branch = translateDnfBranch([Where.in('id', ids)]);

    expect(branch.documentIds).toHaveLength(800);
    expect(branch.documentIds?.[799]).toBe('doc-799');
  });

  it('intersects multiple document-id predicates in an AND branch', () => {
    const branch = translateDnfBranch([
      Where.in('id', ['doc-1', 'doc-2']),
      Where.eq('id', 'doc-2'),
    ]);

    expect(branch.documentId).toBe('doc-2');
    expect(branch.documentIds).toBeUndefined();
  });

  it('represents a contradictory document-id branch as an empty lookup', () => {
    const branch = translateDnfBranch([
      Where.in('id', ['doc-1']),
      Where.eq('id', 'doc-2'),
    ]);

    expect(branch.documentIds).toEqual([]);
    expect(branch.documentId).toBeUndefined();
  });

  it('maps IS_NULL to post-filter', () => {
    const branch = translateDnfBranch([Where.isNull('note')]);
    expect(branch.postFilters).toEqual([{ kind: 'is_null', field: 'note' }]);
  });

  it('rejects range filters on multiple fields in one branch', () => {
    expect(() =>
      translateDnfBranch([Where.gt('a', 1), Where.lt('b', 9)]),
    ).toThrow(/multiple fields/);
  });

  it('translateWhereClause supports top-level AND', () => {
    const branches = translateWhereClause(
      Where.and(Where.eq('userId', 'u1'), Where.eq('status', 'done')),
    );
    expect(branches).toHaveLength(1);
    expect(branches[0]?.filters).toEqual(
      expect.arrayContaining([
        { field: 'userId', op: '==', value: 'u1' },
        { field: 'status', op: '==', value: 'done' },
      ]),
    );
  });
});
