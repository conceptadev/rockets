import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { deleteApp, getApps, initializeApp } from 'firebase-admin/app';

import { AdminFirestoreBackend } from '../backends/admin-firestore.backend';
import { InMemoryFirestoreBackend } from '../backends/in-memory-firestore.backend';
import { FirestoreDuplicateIdException } from '../exceptions/firestore-duplicate-id.exception';
import type { FirestoreBackend } from '../interfaces/firestore-backend.interface';
import type { FirestoreBranchQueryOptions } from '../interfaces/firestore-backend.interface';

describe('Firestore backend emulator parity', () => {
  const collection = `parity-${randomUUID()}`;
  const admin = new AdminFirestoreBackend();
  const memory = new InMemoryFirestoreBackend();
  const backends: FirestoreBackend[] = [admin, memory];

  beforeAll(async () => {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      throw new Error(
        'Run this suite with `corepack yarn test:firestore-emulator`.',
      );
    }
    if (getApps().length === 0) initializeApp({ projectId: 'demo-rockets' });
    const rows: Array<[string, Record<string, unknown>]> = [
      ['missing', { profile: {}, kind: 'missing' }],
      ['null', { profile: { score: null }, kind: 'null' }],
      ['number', { profile: { score: 2 }, kind: 'number', at: new Date(10) }],
      ['string', { profile: { score: '2' }, kind: 'string' }],
      [
        'map-code-point-first',
        { unicodeMap: { '\uE000': 1, '😀': 2 }, kind: 'map' },
      ],
      [
        'map-code-point-second',
        { unicodeMap: { '\uE000': 2, '😀': 1 }, kind: 'map' },
      ],
    ];
    for (const backend of backends) {
      for (const [id, row] of rows) await backend.set(collection, id, row);
    }
  });

  afterAll(async () => {
    for (const app of getApps()) await deleteApp(app);
  });

  async function compare(options: FirestoreBranchQueryOptions) {
    const [adminRows, memoryRows] = await Promise.all(
      backends.map((backend) => backend.queryBranch(collection, options)),
    );
    expect(adminRows.map((row) => row.id)).toEqual(
      memoryRows.map((row) => row.id),
    );
    return adminRows;
  }

  it('matches explicit null without matching missing nested fields', async () => {
    const rows = await compare({
      branch: {
        filters: [{ field: 'profile.score', op: '==', value: null }],
        postFilters: [],
      },
    });
    expect(rows.map((row) => row.id)).toEqual(['null']);
  });

  it('excludes cross-type values from range comparisons', async () => {
    const rows = await compare({
      branch: {
        filters: [{ field: 'profile.score', op: '>', value: 1 }],
        postFilters: [],
      },
    });
    expect(rows.map((row) => row.id)).toEqual(['number']);
  });

  it('matches nested ordering and recursively normalizes timestamps', async () => {
    const rows = await compare({
      branch: { filters: [], postFilters: [] },
      orderBy: [{ field: 'profile.score', direction: 'asc' }],
    });
    expect(rows.map((row) => row.id)).toEqual(['null', 'number', 'string']);
    expect((await admin.get(collection, 'number'))?.at).toBeInstanceOf(Date);
  });

  it('matches server map ordering for Unicode keys', async () => {
    const rows = await compare({
      branch: { filters: [], postFilters: [] },
      orderBy: [{ field: 'unicodeMap', direction: 'asc' }],
    });
    expect(rows.map((row) => row.id)).toEqual([
      'map-code-point-first',
      'map-code-point-second',
    ]);
  });
});

describe('Firestore backend emulator transactions', () => {
  const admin = new AdminFirestoreBackend();
  const memory = new InMemoryFirestoreBackend();

  beforeAll(() => {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      throw new Error(
        'Run this suite with `corepack yarn test:firestore-emulator`.',
      );
    }
    if (getApps().length === 0) initializeApp({ projectId: 'demo-rockets' });
  });

  afterAll(async () => {
    for (const app of getApps()) await deleteApp(app);
  });

  for (const [label, backend] of [
    ['admin', admin],
    ['memory', memory],
  ] as const) {
    it(`${label}: runTransaction commits multi-doc writes atomically`, async () => {
      const collection = `tx-commit-${label}-${randomUUID()}`;
      await backend.create(collection, 'a', { id: 'a', balance: 100 });
      await backend.create(collection, 'b', { id: 'b', balance: 0 });

      await backend.runTransaction(async (tx) => {
        const a = await tx.get(collection, 'a');
        const b = await tx.get(collection, 'b');
        await tx.set(collection, 'a', { id: 'a', balance: 75 }, false);
        await tx.set(collection, 'b', { id: 'b', balance: 25 }, false);
        expect(a?.balance).toBe(100);
        expect(b?.balance).toBe(0);
      });

      expect(await backend.get(collection, 'a')).toMatchObject({ balance: 75 });
      expect(await backend.get(collection, 'b')).toMatchObject({ balance: 25 });
    });

    it(`${label}: runTransaction rolls back on throw`, async () => {
      const collection = `tx-rb-${label}-${randomUUID()}`;
      await backend.create(collection, 'a', { id: 'a', balance: 100 });

      await expect(
        backend.runTransaction(async (tx) => {
          await tx.set(collection, 'a', { id: 'a', balance: 0 }, false);
          throw new Error('abort');
        }),
      ).rejects.toThrow('abort');

      expect(await backend.get(collection, 'a')).toMatchObject({
        balance: 100,
      });
    });

    it(`${label}: transactional create maps duplicate id to FirestoreDuplicateIdException`, async () => {
      const collection = `tx-dup-${label}-${randomUUID()}`;
      await backend.create(collection, 'same', { id: 'same', v: 1 });

      await expect(
        backend.runTransaction(async (tx) => {
          await tx.create(collection, 'same', { id: 'same', v: 2 });
        }),
      ).rejects.toBeInstanceOf(FirestoreDuplicateIdException);
    });

    it(`${label}: transactional queryBranch respects take/limit`, async () => {
      const collection = `tx-limit-${label}-${randomUUID()}`;
      for (let i = 0; i < 5; i += 1) {
        await backend.create(collection, `row-${i}`, {
          id: `row-${i}`,
          rank: i,
        });
      }

      const rows = await backend.runTransaction(async (tx) =>
        tx.queryBranch(collection, {
          branch: { filters: [], postFilters: [] },
          orderBy: [{ field: 'rank', direction: 'asc' }],
          take: 2,
        }),
      );

      expect(rows.map((row) => row.id)).toEqual(['row-0', 'row-1']);
    });
  }

  it('admin: concurrent create of the same id yields exactly one winner', async () => {
    const collection = `tx-race-${randomUUID()}`;
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        admin.runTransaction(async (tx) => {
          await tx.create(collection, 'lease', {
            id: 'lease',
            owner: randomUUID(),
          });
          return 'won';
        }),
      ),
    );

    const wins = results.filter((r) => r.status === 'fulfilled');
    const losses = results.filter((r) => r.status === 'rejected');
    expect(wins).toHaveLength(1);
    expect(losses.length).toBeGreaterThan(0);
    for (const loss of losses) {
      expect(loss.status).toBe('rejected');
      if (loss.status === 'rejected') {
        expect(loss.reason).toBeInstanceOf(FirestoreDuplicateIdException);
      }
    }
    expect(await admin.get(collection, 'lease')).not.toBeNull();
  });
});
