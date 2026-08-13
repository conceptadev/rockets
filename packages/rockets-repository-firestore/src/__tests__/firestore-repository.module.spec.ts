import { describe, it, expect } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  SortOrder,
  Where,
  getDynamicRepositoryToken,
} from '@concepta/nestjs-repository';
import type { RepositoryInterface } from '@concepta/nestjs-repository';

import { InMemoryFirestoreBackend } from '../backends/in-memory-firestore.backend';
import { FirestoreDuplicateIdException } from '../exceptions/firestore-duplicate-id.exception';
import { FirestoreRepositoryModule } from '../firestore-repository.module';

class WidgetEntity {
  id!: string;
  title!: string;
  dateCreated!: Date;
  note?: string | null;
}

class SoftWidgetEntity {
  id!: string;
  title!: string;
  dateRemoved!: Date | null;
}

class OwnedWidgetEntity {
  id!: string;
  title!: string;
  userId!: string;
}

class OrderedWidgetEntity {
  id!: string;
  group!: string;
  rank?: number;
  nested?: { rank: number };
}

describe(FirestoreRepositoryModule.name, () => {
  const backend = new InMemoryFirestoreBackend();

  it('forRoot returns a global module after resolving the backend', () => {
    const root = FirestoreRepositoryModule.forRoot({
      entities: [WidgetEntity],
      backend: new InMemoryFirestoreBackend(),
    });

    expect(root.global).toBe(true);
    expect(root.module).toBe(FirestoreRepositoryModule);
  });

  it('forRoot fails fast when Firebase Admin is not initialized', () => {
    expect(() =>
      FirestoreRepositoryModule.forRoot({ entities: [WidgetEntity] }),
    ).toThrow(/initialize Firebase Admin/);
  });

  it('registers a global dynamic module with a transaction factory', () => {
    const dynModule = FirestoreRepositoryModule.forFeature(
      [{ key: 'widget', entity: WidgetEntity }],
      { backend },
    );

    expect(dynModule.module).toBe(FirestoreRepositoryModule);
    expect(dynModule.providers).toHaveLength(1);
    expect(dynModule.exports).toHaveLength(1);
    expect(dynModule.transactionFactories).toHaveLength(1);
  });

  it('persists and reads through an explicit in-memory backend', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [{ key: 'widget', entity: WidgetEntity, collection: 'widgets-test' }],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<WidgetEntity>>(
      getDynamicRepositoryToken('widget'),
    );

    await repo.create({
      id: 'widget-2',
      title: 'Beta',
      dateCreated: new Date('2025-01-02T00:00:00.000Z'),
    });
    await repo.create({
      id: 'widget-1',
      title: 'Alpha',
      dateCreated: new Date('2025-01-01T00:00:00.000Z'),
    });

    const ordered = await repo.find({
      order: [{ field: 'title', order: SortOrder.ASC }],
    });
    expect(ordered.map((row) => row.id)).toEqual(['widget-1', 'widget-2']);

    const found = await repo.findOne({
      where: Where.eq('id', 'widget-1'),
    });
    expect(found?.title).toBe('Alpha');
  });

  it('applies take and skip', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'widget',
              entity: WidgetEntity,
              collection: 'widgets-paging',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<WidgetEntity>>(
      getDynamicRepositoryToken('widget'),
    );

    await repo.create({ id: 'w1', title: 'A', dateCreated: new Date() });
    await repo.create({ id: 'w2', title: 'B', dateCreated: new Date() });
    await repo.create({ id: 'w3', title: 'C', dateCreated: new Date() });

    const page = await repo.find({
      order: [{ field: 'title', order: SortOrder.ASC }],
      skip: 1,
      take: 1,
    });

    expect(page).toHaveLength(1);
    expect(page[0]?.id).toBe('w2');
  });

  it('soft-deletes and restores when dateRemoved is present on the entity', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'soft-widget',
              entity: SoftWidgetEntity,
              collection: 'soft-widgets',
              softDeleteField: 'dateRemoved',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<SoftWidgetEntity>>(
      getDynamicRepositoryToken('soft-widget'),
    );

    await repo.create({ id: 's1', title: 'Keep', dateRemoved: null });

    const created = await repo.findOne({ where: Where.eq('id', 's1') });
    expect(created).not.toBeNull();

    await repo.softDelete(created!);

    const hidden = await repo.find({ where: Where.eq('id', 's1') });
    expect(hidden).toHaveLength(0);

    const withDeleted = await repo.find({
      where: Where.eq('id', 's1'),
      withDeleted: true,
    });
    expect(withDeleted).toHaveLength(1);

    await repo.restore(withDeleted[0]!);

    const visible = await repo.find({ where: Where.eq('id', 's1') });
    expect(visible).toHaveLength(1);
    expect(visible[0]?.dateRemoved).toBeNull();
  });

  it('findAndCount returns total without take', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'widget',
              entity: WidgetEntity,
              collection: 'widgets-count',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<WidgetEntity>>(
      getDynamicRepositoryToken('widget'),
    );

    await repo.create({ id: 'c1', title: 'One', dateCreated: new Date() });
    await repo.create({ id: 'c2', title: 'Two', dateCreated: new Date() });

    const [rows, total] = await repo.findAndCount({ take: 1 });
    expect(rows).toHaveLength(1);
    expect(total).toBe(2);
  });

  it('applies every predicate when a branch also targets a document id', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'owned-widget',
              entity: OwnedWidgetEntity,
              collection: 'owned-widgets-id-filter',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<OwnedWidgetEntity>>(
      getDynamicRepositoryToken('owned-widget'),
    );

    await repo.create({ id: 'private-1', title: 'Private', userId: 'actor-a' });

    const hidden = await repo.findOne({
      where: Where.and(
        Where.eq<OwnedWidgetEntity>('id', 'private-1'),
        Where.eq<OwnedWidgetEntity>('userId', 'actor-b'),
      ),
    });

    expect(hidden).toBeNull();
  });

  it('supports id IN together with additional predicates', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'owned-widget',
              entity: OwnedWidgetEntity,
              collection: 'owned-widgets-id-in',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<OwnedWidgetEntity>>(
      getDynamicRepositoryToken('owned-widget'),
    );

    await repo.create({ id: 'owned-a', title: 'A', userId: 'actor-a' });
    await repo.create({ id: 'owned-b', title: 'B', userId: 'actor-b' });
    await repo.create({ id: 'outside-set', title: 'C', userId: 'actor-a' });

    const rows = await repo.find({
      where: Where.and(
        Where.in<OwnedWidgetEntity>('id', ['owned-a', 'owned-b']),
        Where.eq<OwnedWidgetEntity>('userId', 'actor-a'),
      ),
    });

    expect(rows.map((row) => row.id)).toEqual(['owned-a']);
  });

  it('returns no rows for an empty id IN without falling back to a collection scan', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'owned-widget',
              entity: OwnedWidgetEntity,
              collection: 'owned-widgets-empty-id-in',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<OwnedWidgetEntity>>(
      getDynamicRepositoryToken('owned-widget'),
    );

    await repo.create({ id: 'existing', title: 'A', userId: 'actor-a' });

    await expect(
      repo.find({ where: Where.in<OwnedWidgetEntity>('id', []) }),
    ).resolves.toEqual([]);
  });

  it('rejects an empty id instead of dropping the id predicate', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'owned-widget',
              entity: OwnedWidgetEntity,
              collection: 'owned-widgets-empty-id',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<OwnedWidgetEntity>>(
      getDynamicRepositoryToken('owned-widget'),
    );

    await repo.create({ id: 'existing', title: 'A', userId: 'actor-a' });

    await expect(
      repo.find({
        where: Where.and(
          Where.in<OwnedWidgetEntity>('id', ['']),
          Where.eq<OwnedWidgetEntity>('userId', 'actor-a'),
        ),
      }),
    ).rejects.toThrow(/query the owned-widget repository/);
  });

  it('distinguishes missing fields from null for isNull and nin', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'widget',
              entity: WidgetEntity,
              collection: 'widgets-missing-null',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<WidgetEntity>>(
      getDynamicRepositoryToken('widget'),
    );

    await repo.create({ id: 'missing', title: 'Missing' });
    await repo.create({ id: 'null', title: 'Null', note: null });
    await repo.create({ id: 'kept', title: 'Kept', note: 'kept' });
    await repo.create({ id: 'blocked', title: 'Blocked', note: 'blocked' });

    await expect(repo.find({ where: Where.isNull('note') })).resolves.toEqual([
      expect.objectContaining({ id: 'null' }),
    ]);
    await expect(
      repo.find({ where: Where.notIn('note', ['blocked']) }),
    ).resolves.toEqual([expect.objectContaining({ id: 'kept' })]);
  });

  it('returns the generated id from upsert', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'widget',
              entity: WidgetEntity,
              collection: 'widget-upsert',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<WidgetEntity>>(
      getDynamicRepositoryToken('widget'),
    );

    const result = await repo.upsert({ title: 'Generated id' });

    expect(result.id).toEqual(expect.any(String));
    await expect(
      repo.findOne({ where: Where.eq('id', result.id) }),
    ).resolves.toMatchObject({ id: result.id, title: 'Generated id' });
  });

  it('merges repeated upserts with the same explicit id', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'widget',
              entity: WidgetEntity,
              collection: 'widget-explicit-upsert',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<WidgetEntity>>(
      getDynamicRepositoryToken('widget'),
    );
    const createdAt = new Date('2026-01-01T00:00:00.000Z');

    await repo.upsert({
      id: 'stable-id',
      title: 'First',
      dateCreated: createdAt,
    });
    await repo.upsert({ id: 'stable-id', title: 'Second' });

    await expect(repo.find()).resolves.toEqual([
      expect.objectContaining({
        id: 'stable-id',
        title: 'Second',
        dateCreated: createdAt,
      }),
    ]);
  });

  it('rejects create when the document id already exists', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'widget',
              entity: WidgetEntity,
              collection: 'widget-duplicate-create',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<WidgetEntity>>(
      getDynamicRepositoryToken('widget'),
    );

    await repo.create({ id: 'same-id', title: 'Original' });

    await expect(
      repo.create({ id: 'same-id', title: 'Replacement' }),
    ).rejects.toBeInstanceOf(FirestoreDuplicateIdException);
    await expect(
      repo.findOne({ where: Where.eq('id', 'same-id') }),
    ).resolves.toMatchObject({ title: 'Original' });
  });

  it('uses every order clause as a deterministic tie-breaker', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'ordered-widget',
              entity: OrderedWidgetEntity,
              collection: 'ordered-widgets',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<OrderedWidgetEntity>>(
      getDynamicRepositoryToken('ordered-widget'),
    );

    await repo.create({ id: 'rank-2', group: 'same', rank: 2 });
    await repo.create({ id: 'rank-1', group: 'same', rank: 1 });

    const rows = await repo.find({
      order: [
        { field: 'group', order: SortOrder.ASC },
        { field: 'rank', order: SortOrder.ASC },
      ],
    });

    expect(rows.map((row) => row.id)).toEqual(['rank-1', 'rank-2']);
  });

  it('orders descending by a nested field path', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'ordered-widget',
              entity: OrderedWidgetEntity,
              collection: 'ordered-widgets-nested',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<OrderedWidgetEntity>>(
      getDynamicRepositoryToken('ordered-widget'),
    );

    await repo.create({ id: 'low', group: 'same', nested: { rank: 1 } });
    await repo.create({ id: 'high', group: 'same', nested: { rank: 2 } });

    const rows = await repo.find({
      order: [{ field: 'nested.rank', order: SortOrder.DESC }],
    });

    expect(rows.map((row) => row.id)).toEqual(['high', 'low']);
  });

  it('excludes documents missing the ordered field', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'ordered-widget',
              entity: OrderedWidgetEntity,
              collection: 'ordered-widgets-missing',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<OrderedWidgetEntity>>(
      getDynamicRepositoryToken('ordered-widget'),
    );

    await repo.create({ id: 'missing', group: 'same' });
    await repo.create({ id: 'present', group: 'same', rank: 1 });

    const rows = await repo.find({
      order: [{ field: 'rank', order: SortOrder.ASC }],
    });

    expect(rows.map((row) => row.id)).toEqual(['present']);
  });

  it('treats a missing soft-delete field as live by default', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'soft-widget',
              entity: SoftWidgetEntity,
              collection: 'soft-widgets-missing-field',
              softDeleteField: 'dateRemoved',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<SoftWidgetEntity>>(
      getDynamicRepositoryToken('soft-widget'),
    );

    await repo.create({ id: 'live', title: 'Live' });

    await expect(repo.find()).resolves.toEqual([
      expect.objectContaining({ id: 'live' }),
    ]);
  });
});
