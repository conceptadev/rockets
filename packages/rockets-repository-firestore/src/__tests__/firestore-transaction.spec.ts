import { describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import {
  getDynamicRepositoryToken,
  RepositoryModule,
  TransactionScope,
  Where,
  type RepositoryInterface,
  type RepositoryModuleInterface,
  type RepositoryProviderOptions,
} from '@concepta/nestjs-repository';

import { InMemoryFirestoreBackend } from '../backends/in-memory-firestore.backend';
import { FirestoreRepositoryModule } from '../firestore-repository.module';
import { FirestoreTransaction } from '../transaction/firestore-transaction';
import { FirestoreTransactionRetryUnsupportedException } from '../exceptions/firestore-transaction-retry-unsupported.exception';
import { runInFirestoreTransaction } from '../transaction/run-in-firestore-transaction';
import type { FirestoreBackend } from '../interfaces/firestore-backend.interface';
import type { FirestoreTransactionHandle } from '../interfaces/firestore-transaction-handle.interface';
import { FirestoreDuplicateIdException } from '../exceptions/firestore-duplicate-id.exception';

class AccountEntity {
  id!: string;
  balance!: number;
}

function firestoreModuleFor(
  backend: InMemoryFirestoreBackend,
  collection: string,
): RepositoryModuleInterface {
  return {
    name: FirestoreRepositoryModule.name,
    forFeature: (entities: RepositoryProviderOptions[]) =>
      FirestoreRepositoryModule.forFeature(
        entities.map((entity) => ({
          key: entity.key,
          entity: entity.entity,
          collection,
        })),
        { backend },
      ),
  };
}

describe('Firestore transactions (P1-1)', () => {
  let backend: InMemoryFirestoreBackend;

  beforeEach(() => {
    backend = new InMemoryFirestoreBackend();
  });

  it('registers a transaction factory on forFeature', () => {
    const feature = FirestoreRepositoryModule.forFeature(
      [{ key: 'account', entity: AccountEntity, collection: 'accounts-tx' }],
      { backend },
    );

    expect(feature.transactionFactories).toHaveLength(1);
    expect(feature.transactionFactories?.[0]?.key).toMatch(/^firestore:/);
  });

  it('runTransaction commits multi-doc writes atomically', async () => {
    await backend.create('accounts-cb', 'a', { id: 'a', balance: 100 });
    await backend.create('accounts-cb', 'b', { id: 'b', balance: 0 });

    await backend.runTransaction(async (tx) => {
      const a = await tx.get('accounts-cb', 'a');
      const b = await tx.get('accounts-cb', 'b');
      expect(a).not.toBeNull();
      expect(b).not.toBeNull();
      await tx.set('accounts-cb', 'a', { id: 'a', balance: 75 }, false);
      await tx.set('accounts-cb', 'b', { id: 'b', balance: 25 }, false);
    });

    expect(await backend.get('accounts-cb', 'a')).toMatchObject({
      balance: 75,
    });
    expect(await backend.get('accounts-cb', 'b')).toMatchObject({
      balance: 25,
    });
  });

  it('runTransaction discards writes when the callback throws', async () => {
    await backend.create('accounts-rb', 'a', { id: 'a', balance: 100 });

    await expect(
      backend.runTransaction(async (tx) => {
        await tx.set('accounts-rb', 'a', { id: 'a', balance: 0 }, false);
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    expect(await backend.get('accounts-rb', 'a')).toMatchObject({
      balance: 100,
    });
  });

  it('runTransaction rejects read-after-write', async () => {
    await backend.create('accounts-raw', 'a', { id: 'a', balance: 100 });

    await expect(
      backend.runTransaction(async (tx) => {
        await tx.set('accounts-raw', 'a', { id: 'a', balance: 50 }, false);
        await tx.get('accounts-raw', 'a');
      }),
    ).rejects.toThrow(/all reads before all writes/);
  });

  it('imperative bridge refuses a Firestore retry instead of empty commit', async () => {
    let attempts = 0;
    const retryingBackend: FirestoreBackend = {
      get: async () => null,
      create: async () => undefined,
      set: async () => undefined,
      delete: async () => undefined,
      queryBranch: async () => [],
      countBranch: async () => 0,
      runTransaction: async (fn) => {
        const handle = {
          get: async () => ({ id: 'a', balance: 100 }),
          create: async () => undefined,
          set: async () => undefined,
          delete: async () => undefined,
          queryBranch: async () => [],
          countBranch: async () => 0,
        } satisfies FirestoreTransactionHandle;
        attempts += 1;
        await fn(handle);
        // Simulate SDK retry after the first successful callback return.
        attempts += 1;
        await fn(handle);
        return undefined as never;
      },
    };

    const tx = new FirestoreTransaction(retryingBackend);
    await tx.start();
    tx.markDirty();
    await expect(tx.commit()).rejects.toBeInstanceOf(
      FirestoreTransactionRetryUnsupportedException,
    );
    expect(attempts).toBe(2);
  });

  it('runInFirestoreTransaction joins ambient handle on repo calls', async () => {
    const wired = await Test.createTestingModule({
      imports: [
        RepositoryModule.forRoot({}),
        RepositoryModule.forFeature({
          module: firestoreModuleFor(backend, 'accounts-callback'),
          entities: [{ key: 'account', entity: AccountEntity }],
        }),
      ],
    }).compile();

    const repo = wired.get<RepositoryInterface<AccountEntity>>(
      getDynamicRepositoryToken('account'),
    );

    await repo.create({ id: 'a', balance: 100 });
    await repo.create({ id: 'b', balance: 0 });

    await runInFirestoreTransaction(backend, async () => {
      const a = await repo.findOne({ where: Where.eq('id', 'a') });
      const b = await repo.findOne({ where: Where.eq('id', 'b') });
      await repo.update(a!, { balance: 70 });
      await repo.update(b!, { balance: 30 });
    });

    expect(await repo.findOne({ where: Where.eq('id', 'a') })).toMatchObject({
      balance: 70,
    });
    expect(await repo.findOne({ where: Where.eq('id', 'b') })).toMatchObject({
      balance: 30,
    });
  });

  it('runInFirestoreTransaction re-executes the body when the SDK retries', async () => {
    let bodyRuns = 0;
    let attempts = 0;
    const retryingBackend: FirestoreBackend = {
      get: async () => null,
      create: async () => undefined,
      set: async () => undefined,
      delete: async () => undefined,
      queryBranch: async () => [],
      countBranch: async () => 0,
      runTransaction: async (fn) => {
        const handle = {
          get: async () => null,
          create: async () => undefined,
          set: async () => undefined,
          delete: async () => undefined,
          queryBranch: async () => [],
          countBranch: async () => 0,
        } satisfies FirestoreTransactionHandle;
        attempts += 1;
        await fn(handle);
        if (attempts === 1) {
          attempts += 1;
          return fn(handle);
        }
        return undefined as never;
      },
    };

    await runInFirestoreTransaction(retryingBackend, async () => {
      bodyRuns += 1;
    });

    expect(attempts).toBe(2);
    expect(bodyRuns).toBe(2);
  });

  it('runInFirestoreTransaction surfaces duplicate create as FirestoreDuplicateIdException', async () => {
    await backend.create('dup-coll', 'same', { id: 'same', balance: 1 });

    await expect(
      backend.runTransaction(async (tx) => {
        await tx.create('dup-coll', 'same', { id: 'same', balance: 2 });
      }),
    ).rejects.toBeInstanceOf(FirestoreDuplicateIdException);
  });

  it('TransactionScope + { ctx } joins ambient transaction on repo calls', async () => {
    const wired = await Test.createTestingModule({
      imports: [
        RepositoryModule.forRoot({}),
        RepositoryModule.forFeature({
          module: firestoreModuleFor(backend, 'accounts-scope'),
          entities: [{ key: 'account', entity: AccountEntity }],
        }),
      ],
    }).compile();

    const repo = wired.get<RepositoryInterface<AccountEntity>>(
      getDynamicRepositoryToken('account'),
    );
    const scope = wired.get(TransactionScope);

    await repo.create({ id: 'a', balance: 100 });
    await repo.create({ id: 'b', balance: 0 });

    await scope.run({}, async (ctx) => {
      const a = await repo.findOne({ where: Where.eq('id', 'a'), ctx });
      const b = await repo.findOne({ where: Where.eq('id', 'b'), ctx });
      expect(a?.balance).toBe(100);
      expect(b?.balance).toBe(0);
      await repo.update(a!, { balance: 60 }, { ctx });
      await repo.update(b!, { balance: 40 }, { ctx });
    });

    expect(await repo.findOne({ where: Where.eq('id', 'a') })).toMatchObject({
      balance: 60,
    });
    expect(await repo.findOne({ where: Where.eq('id', 'b') })).toMatchObject({
      balance: 40,
    });
  });

  it('TransactionScope rolls back repo writes when the operation throws', async () => {
    const wired = await Test.createTestingModule({
      imports: [
        RepositoryModule.forRoot({}),
        RepositoryModule.forFeature({
          module: firestoreModuleFor(backend, 'accounts-scope-rb'),
          entities: [{ key: 'account', entity: AccountEntity }],
        }),
      ],
    }).compile();

    const repo = wired.get<RepositoryInterface<AccountEntity>>(
      getDynamicRepositoryToken('account'),
    );
    const scope = wired.get(TransactionScope);

    await repo.create({ id: 'a', balance: 100 });

    await expect(
      scope.run({}, async (ctx) => {
        const a = await repo.findOne({ where: Where.eq('id', 'a'), ctx });
        await repo.update(a!, { balance: 1 }, { ctx });
        throw new Error('abort');
      }),
    ).rejects.toThrow('abort');

    expect(await repo.findOne({ where: Where.eq('id', 'a') })).toMatchObject({
      balance: 100,
    });
  });

  it('propagation MANDATORY throws when no factory is registered', async () => {
    const empty = await Test.createTestingModule({
      imports: [RepositoryModule.forRoot({})],
    }).compile();
    const scope = empty.get(TransactionScope);

    await expect(
      scope.run({}, async () => 'ok', { propagation: 'MANDATORY' }),
    ).rejects.toThrow();
  });
});
