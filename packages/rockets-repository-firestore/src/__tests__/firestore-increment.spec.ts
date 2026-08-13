import { describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  getDynamicRepositoryToken,
  Where,
  type RepositoryInterface,
} from '@concepta/nestjs-repository';

import { InMemoryFirestoreBackend } from '../backends/in-memory-firestore.backend';
import { FirestorePreconditionFailedException } from '../exceptions/firestore-precondition-failed.exception';
import { FirestoreRepositoryModule } from '../firestore-repository.module';
import { isFirestoreRepository } from '../repository/firestore-repository';

class CounterEntity {
  id!: string;
  name!: string;
  count!: number;
}

describe('FirestoreRepository.increment', () => {
  it('writes only the counter field (does not clobber concurrent siblings)', async () => {
    const backend = new InMemoryFirestoreBackend();
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'counter',
              entity: CounterEntity,
              collection: 'counters-increment',
            },
          ],
          { backend },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<CounterEntity>>(
      getDynamicRepositoryToken('counter'),
    );
    expect(isFirestoreRepository(repo)).toBe(true);
    if (!isFirestoreRepository(repo)) {
      throw new Error('expected FirestoreRepository');
    }

    const created = await repo.create({
      id: 'c1',
      name: 'A',
      count: 5,
    });

    await backend.set('counters-increment', 'c1', { name: 'B' }, true);

    await repo.increment(created, 'count', 1);

    const stored = await backend.get('counters-increment', 'c1');
    expect(stored).toEqual({
      id: 'c1',
      name: 'B',
      count: 6,
    });
  });

  it('rejects a missing document when exists: true (default)', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'counter',
              entity: CounterEntity,
              collection: 'counters-missing',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<CounterEntity>>(
      getDynamicRepositoryToken('counter'),
    );
    expect(isFirestoreRepository(repo)).toBe(true);
    if (!isFirestoreRepository(repo)) {
      throw new Error('expected FirestoreRepository');
    }

    await expect(
      repo.increment({ id: 'missing', name: 'x', count: 0 }, 'count', 1),
    ).rejects.toBeInstanceOf(FirestorePreconditionFailedException);
  });

  it('updateWithPrecondition writes the patch when the document exists', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'counter',
              entity: CounterEntity,
              collection: 'counters-cas-ok',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<CounterEntity>>(
      getDynamicRepositoryToken('counter'),
    );
    expect(isFirestoreRepository(repo)).toBe(true);
    if (!isFirestoreRepository(repo)) {
      throw new Error('expected FirestoreRepository');
    }

    const created = await repo.create({ id: 'c1', name: 'A', count: 1 });
    await repo.updateWithPrecondition(
      created,
      { name: 'B' },
      { precondition: { exists: true } },
    );

    await expect(
      repo.findOne({ where: Where.eq('id', 'c1') }),
    ).resolves.toMatchObject({ name: 'B', count: 1 });
  });

  it('updateWithPrecondition fails when exists: true and the document is missing', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        FirestoreRepositoryModule.forFeature(
          [
            {
              key: 'counter',
              entity: CounterEntity,
              collection: 'counters-cas',
            },
          ],
          { backend: new InMemoryFirestoreBackend() },
        ),
      ],
    }).compile();

    const repo = moduleRef.get<RepositoryInterface<CounterEntity>>(
      getDynamicRepositoryToken('counter'),
    );
    expect(isFirestoreRepository(repo)).toBe(true);
    if (!isFirestoreRepository(repo)) {
      throw new Error('expected FirestoreRepository');
    }

    await expect(
      repo.updateWithPrecondition(
        { id: 'missing', name: 'x', count: 0 },
        { name: 'y' },
        { precondition: { exists: true } },
      ),
    ).rejects.toBeInstanceOf(FirestorePreconditionFailedException);
  });
});
