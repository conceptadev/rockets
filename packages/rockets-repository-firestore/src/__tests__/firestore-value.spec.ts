import { describe, expect, it } from 'vitest';

import { applyFirestoreFilters } from '../repository/firestore-row-filter';
import { sortFirestoreRows } from '../repository/firestore-sort';
import {
  compareFirestoreValues,
  firestoreValuesEqual,
  normalizeFirestoreValue,
  readFirestoreField,
} from '../repository/firestore-value';

class TimestampStub {
  constructor(private readonly date: Date) {}

  toDate(): Date {
    return this.date;
  }

  isEqual(other: unknown): boolean {
    return (
      other instanceof TimestampStub &&
      other.toDate().getTime() === this.date.getTime()
    );
  }
}

class DocumentReferenceStub {
  constructor(readonly path: string) {}
}

class GeoPointStub {
  constructor(readonly latitude: number, readonly longitude: number) {}
}

class VectorValueStub {
  constructor(private readonly values: readonly number[]) {}

  toArray(): number[] {
    return [...this.values];
  }
}

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

  it('excludes missing and null values while comparing ranges across types', () => {
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
    ).toEqual(['string', 'number']);
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

  it('matches server equality for NaN and signed zero', () => {
    // Firestore `== NaN` compiles to the IS_NAN unary filter, so NaN matches
    // NaN; -0 equals 0. NaN never equals a non-NaN number.
    expect(firestoreValuesEqual(Number.NaN, Number.NaN)).toBe(true);
    expect(firestoreValuesEqual(Number.NaN, 5)).toBe(false);
    expect(firestoreValuesEqual(-0, 0)).toBe(true);
    expect(firestoreValuesEqual(0, -0)).toBe(true);
    expect(firestoreValuesEqual([Number.NaN], [Number.NaN])).toBe(true);
    expect(firestoreValuesEqual({ value: -0 }, { value: 0 })).toBe(true);
  });

  it('orders strings by code points like the server, not UTF-16 units', () => {
    // U+1F600 (😀, UTF-16 surrogate D83D) vs U+FB01 (ﬁ): code-point order
    // puts the emoji AFTER, UTF-16 unit order would put it before.
    expect(compareFirestoreValues('😀', 'ﬁ')).toBeGreaterThan(0);
    expect(compareFirestoreValues('ﬁ', '😀')).toBeLessThan(0);
    expect(compareFirestoreValues('abc', 'abd')).toBeLessThan(0);
    expect(compareFirestoreValues('ab', 'abc')).toBeLessThan(0);
    expect(compareFirestoreValues('😀', '😀')).toBe(0);
  });

  it('compares timestamp-like SDK values with dates before SDK equality', () => {
    const date = new Date('2026-01-01T00:00:00.000Z');
    const timestamp = new TimestampStub(date);

    expect(firestoreValuesEqual(date, timestamp)).toBe(true);
    expect(firestoreValuesEqual(timestamp, date)).toBe(true);
  });

  it('orders NaN below every other number with a consistent comparator', () => {
    expect(compareFirestoreValues(Number.NaN, 5)).toBeLessThan(0);
    expect(compareFirestoreValues(5, Number.NaN)).toBeGreaterThan(0);
    expect(compareFirestoreValues(Number.NaN, Number.NaN)).toBe(0);
  });

  it('orders every Firestore value type', () => {
    const values = [
      { z: 1 },
      new VectorValueStub([1]),
      [1],
      new GeoPointStub(1, 2),
      new DocumentReferenceStub('widgets/one'),
      new Uint8Array([1]),
      'a',
      new Date(1),
      1,
      true,
      null,
    ];

    expect([...values].sort(compareFirestoreValues)).toEqual([
      null,
      true,
      1,
      new Date(1),
      'a',
      new Uint8Array([1]),
      new DocumentReferenceStub('widgets/one'),
      new GeoPointStub(1, 2),
      [1],
      new VectorValueStub([1]),
      { z: 1 },
    ]);
  });

  it('orders compound Firestore values by their documented contents', () => {
    expect(compareFirestoreValues([1, 2], [1, 2, 3])).toBeLessThan(0);
    expect(compareFirestoreValues({ a: 1 }, { a: 2 })).toBeLessThan(0);
    expect(
      compareFirestoreValues(new GeoPointStub(1, 9), new GeoPointStub(2, 0)),
    ).toBeLessThan(0);
    expect(
      compareFirestoreValues(
        new VectorValueStub([999]),
        new VectorValueStub([0, 0]),
      ),
    ).toBeLessThan(0);
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

  it('names the ordered field when a value cannot be ordered locally', () => {
    expect(() =>
      sortFirestoreRows(
        [
          { id: 'one', unsupported: Symbol('one') },
          { id: 'two', unsupported: Symbol('two') },
        ],
        [{ field: 'unsupported', direction: 'asc' }],
      ),
    ).toThrow(/field "unsupported"/);
  });

  it('normalizes timestamps recursively', () => {
    const date = new Date('2026-01-01T00:00:00.000Z');
    expect(
      normalizeFirestoreValue({ nested: [{ at: { toDate: () => date } }] }),
    ).toEqual({ nested: [{ at: date }] });
  });
});
