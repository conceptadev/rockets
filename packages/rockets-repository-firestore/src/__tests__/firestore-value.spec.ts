import { describe, expect, it } from 'vitest';

import { applyFirestoreFilters } from '../repository/firestore-row-filter';
import { sortFirestoreRows } from '../repository/firestore-sort';
import {
  firestoreValuesEqual,
  normalizeFirestoreValue,
  readFirestoreField,
} from '../repository/firestore-value';

describe('local Firestore value semantics', () => {
  it('distinguishes missing nested fields from explicit null', () => {
    expect(
      readFirestoreField({ profile: { name: null } }, 'profile.name'),
    ).toEqual({
      exists: true,
      value: null,
    });
    expect(readFirestoreField({ profile: {} }, 'profile.name')).toEqual({
      exists: false,
      value: undefined,
    });
    expect(
      applyFirestoreFilters(
        [{ id: 'missing' }, { id: 'null', value: null }],
        [{ field: 'value', op: '==', value: null }],
      ).map((row) => row.id),
    ).toEqual(['null']);
  });

  it('excludes missing, null, and cross-type values from inequalities', () => {
    const rows = [
      { id: 'missing' },
      { id: 'null', value: null },
      { id: 'string', value: '2' },
      { id: 'number', value: 2 },
    ];
    expect(
      applyFirestoreFilters(rows, [{ field: 'value', op: '>', value: 1 }]).map(
        (row) => row.id,
      ),
    ).toEqual(['number']);
    expect(
      applyFirestoreFilters(rows, [{ field: 'value', op: '!=', value: 3 }]).map(
        (row) => row.id,
      ),
    ).toEqual(['string', 'number']);
  });

  it('compares arrays, maps, bytes, dates, and SDK values structurally', () => {
    expect(firestoreValuesEqual([1, { ok: true }], [1, { ok: true }])).toBe(
      true,
    );
    expect(
      firestoreValuesEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2])),
    ).toBe(true);
    expect(firestoreValuesEqual(new Date(10), new Date(10))).toBe(true);
    expect(
      firestoreValuesEqual(
        { isEqual: (other: unknown) => other === 'same' },
        'same',
      ),
    ).toBe(true);
  });

  it('orders supported scalars and excludes missing ordered fields', () => {
    const rows = [
      { id: 'missing' },
      { id: 'string', value: 'a' },
      { id: 'number', value: 1 },
      { id: 'true', value: true },
      { id: 'null', value: null },
    ];
    expect(
      sortFirestoreRows(rows, [{ field: 'value', direction: 'asc' }]).map(
        (row) => row.id,
      ),
    ).toEqual(['null', 'true', 'number', 'string']);
  });

  it('normalizes timestamps recursively', () => {
    const date = new Date('2026-01-01T00:00:00.000Z');
    expect(
      normalizeFirestoreValue({ nested: [{ at: { toDate: () => date } }] }),
    ).toEqual({ nested: [{ at: date }] });
  });
});
