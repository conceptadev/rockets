import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { deleteApp, getApps, initializeApp } from 'firebase-admin/app';

import { AdminFirestoreBackend } from '../backends/admin-firestore.backend';
import { InMemoryFirestoreBackend } from '../backends/in-memory-firestore.backend';
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
