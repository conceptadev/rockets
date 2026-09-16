/**
 * The documented way to reach the driver's transaction client
 * (CONFIGURATION.md §8a).
 *
 * Row-level security and anything else that needs a session variable runs
 * on the transaction's own client. Three things have to hold for the
 * documented snippet to work, and all three are easy to get wrong:
 * `TrxCtx` must be importable from this package, the adapter's key must be
 * `typeorm:<data source name>`, and `getClient()` must hand back the
 * client the scope's transaction is actually running on — not a second
 * connection that commits on its own.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import {
  AppContextHost,
  TransactionScope,
  TrxCtx,
  defineModuleResource,
} from '../index';
import { RocketsCoreModule } from '../rockets-core.module';

@Entity('trx_client_rows')
class RowEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) label!: string;
}

/** The snippet in CONFIGURATION.md §8a, run for real. */
async function managerFromScope(txCtx: object): Promise<EntityManager> {
  const host = AppContextHost.from(txCtx);
  expect(host.supports(TrxCtx)).toBe(true);
  const { trx } = host.with(TrxCtx);
  const transaction = await trx.getOrStart('typeorm:default');
  return transaction.getClient<EntityManager>();
}

describe('reaching the transaction client (e2e, CONFIGURATION §8a)', () => {
  let app: INestApplication;
  let scope: TransactionScope;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [RowEntity],
          synchronize: true,
          dropSchema: true,
        }),
        RocketsCoreModule.forRoot({
          repository: TypeOrmRepositoryModule,
          resources: [defineModuleResource({ entities: [RowEntity] })],
          global: true,
        }),
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    scope = app.get(TransactionScope);
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('hands back the scope transaction client, keyed by data source', async () => {
    const ctx = AppContextHost.from();
    const label = await scope.run(ctx, async (txCtx) => {
      const manager = await managerFromScope(txCtx);
      expect(typeof manager.query).toBe('function');
      await manager.query(
        `INSERT INTO trx_client_rows (id, label) VALUES ('committed', 'kept')`,
      );
      return 'kept';
    });
    expect(label).toBe('kept');
  });

  it('is the same transaction: a failing scope takes its writes with it', async () => {
    const ctx = AppContextHost.from();
    await expect(
      scope.run(ctx, async (txCtx) => {
        const manager = await managerFromScope(txCtx);
        await manager.query(
          `INSERT INTO trx_client_rows (id, label) VALUES ('rolled-back', 'gone')`,
        );
        throw new Error('probe: fail inside the scope');
      }),
    ).rejects.toThrow('probe: fail inside the scope');
  });

  it('committed the first write and rolled back the second', async () => {
    const ctx = AppContextHost.from();
    const rows = await scope.run(ctx, async (txCtx) => {
      const manager = await managerFromScope(txCtx);
      return manager.query<{ id: string }[]>(
        `SELECT id FROM trx_client_rows ORDER BY id`,
      );
    });
    expect(rows.map((row) => row.id)).toEqual(['committed']);
  });
});
