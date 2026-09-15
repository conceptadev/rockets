/**
 * Soft-deleted rows and unbounded lists on generated routes (issue #119).
 *
 * Upstream `nestjs-crud` honours `?includeDeleted=1` on any entity with a
 * delete column and returns every row when no limit is configured. Both
 * are closed by default on `defineResource`:
 *
 * - a `list` / `read` route refuses `includeDeleted` with a `400` unless
 *   its operation sets `includeDeleted: true`;
 * - a `list` route returns at most 100 rows unless its operation sets its
 *   own `maxLimit`, and `limit` sets the page size for a request that
 *   sends none.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  INestApplication,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import { withOpenApi } from '@concepta/nestjs-core';
import { CrudMaxLimit } from '@concepta/nestjs-crud';
import {
  getDynamicRepositoryToken,
  Where,
  type RepositoryInterface,
} from '@concepta/nestjs-repository';
import request from 'supertest';
import { z } from 'zod';
import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import { extractBearerToken } from '../infrastructure/auth/extract-bearer-token';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { defineResource } from '../infrastructure/resource/define-resource';
import { RocketsCoreModule } from '../rockets-core.module';

@Injectable()
class StubAuthAdapter implements AuthAdapterInterface {
  async authenticate(req: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(req);
    if (token === null) return { matched: false };
    if (token === 'u1') return { matched: true, user: { id: 'u1', sub: 'u1' } };
    return { matched: true, error: new UnauthorizedException() };
  }
}

@Entity('list_safety_widgets')
class WidgetEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  @DeleteDateColumn() dateDeleted?: Date;
}

@Entity('list_safety_archive')
class ArchiveEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  @DeleteDateColumn() dateDeleted?: Date;
}

@Entity('list_safety_paged')
class PagedEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
}

/** Has a delete column but only a hard-delete route. */
@Entity('list_safety_hard')
class HardEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  @DeleteDateColumn() dateDeleted?: Date;
}

@Entity('list_safety_decorated')
class DecoratedEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
}

const createSchema = withOpenApi(
  z.object({ name: z.string() }),
  'ListSafetyCreateDto',
);
const responseSchema = withOpenApi(
  z.object({ id: z.uuid(), name: z.string() }),
  'ListSafetyResponseDto',
);

/** Default: no `includeDeleted`, default 100-row cap. */
const widgetResource = defineResource<WidgetEntity>({
  key: 'widget',
  entity: WidgetEntity,
  path: 'widgets',
  operations: {
    list: { output: responseSchema },
    read: { output: responseSchema },
    create: { input: createSchema, output: responseSchema },
    update: { input: createSchema, output: responseSchema },
    replace: { input: createSchema, output: responseSchema },
    delete: { soft: true },
  },
});

/** Opted in to `includeDeleted` on list and read. */
const archiveResource = defineResource<ArchiveEntity>({
  key: 'archive',
  entity: ArchiveEntity,
  path: 'archive',
  operations: {
    list: { output: responseSchema, includeDeleted: true },
    read: { output: responseSchema, includeDeleted: true },
    create: { input: createSchema, output: responseSchema },
    delete: { soft: true },
  },
});

/** Its own page size and cap. */
const pagedResource = defineResource<PagedEntity>({
  key: 'paged',
  entity: PagedEntity,
  path: 'paged',
  operations: {
    list: { output: responseSchema, limit: 10, maxLimit: 20 },
    create: { input: createSchema, output: responseSchema },
  },
});

const hardResource = defineResource<HardEntity>({
  key: 'hard',
  entity: HardEntity,
  path: 'hard',
  operations: {
    read: { output: responseSchema },
    delete: {},
  },
});

/** A cap set through the operation's own decorators, below the default. */
const decoratedResource = defineResource<DecoratedEntity>({
  key: 'decorated',
  entity: DecoratedEntity,
  path: 'decorated',
  operations: {
    list: { output: responseSchema, decorators: [CrudMaxLimit(3)] },
    create: { input: createSchema, output: responseSchema },
  },
});

describe('list safety on generated routes (e2e, #119)', () => {
  let app: INestApplication;

  const create = async (path: string, name: string): Promise<string> => {
    const res = await request(app.getHttpServer())
      .post(`/${path}`)
      .set('Authorization', 'Bearer u1')
      .send({ name })
      .expect(201);
    return res.body.id;
  };

  const get = (path: string) =>
    request(app.getHttpServer()).get(path).set('Authorization', 'Bearer u1');

  /**
   * Bulk rows go straight through the repository, in one call. These
   * entities have no hooks, and a hundred HTTP round-trips only add time
   * the limit under test does not depend on — time that, under load, made
   * one slow seed time out and starve the tests after it. No `ctx` for
   * the same reason.
   */
  const seed = async (
    key: string,
    count: number,
    prefix: string,
  ): Promise<void> => {
    const repo = app.get<RepositoryInterface<{ name: string }>>(
      getDynamicRepositoryToken(key),
    );
    await repo.createMany(
      Array.from({ length: count }, (_, i) => ({ name: `${prefix}-${i}` })),
    );
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            WidgetEntity,
            ArchiveEntity,
            PagedEntity,
            HardEntity,
            DecoratedEntity,
          ],
          synchronize: true,
          dropSchema: true,
        }),
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(StubAuthAdapter),
          providers: [StubAuthAdapter],
          repository: TypeOrmRepositoryModule,
          resources: [
            widgetResource,
            archiveResource,
            pagedResource,
            hardResource,
            decoratedResource,
          ],
          global: true,
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('includeDeleted', () => {
    it('is refused on a route that did not opt in, and deleted rows stay hidden', async () => {
      const kept = await create('widgets', 'kept');
      const removed = await create('widgets', 'removed');
      const del = await request(app.getHttpServer())
        .delete(`/widgets/${removed}`)
        .set('Authorization', 'Bearer u1');
      expect(del.status).toBeLessThan(300);

      await get('/widgets?includeDeleted=1').expect(400);
      await get(`/widgets/${removed}?includeDeleted=1`).expect(400);
      // Any value is refused — the route does not read the parameter at all.
      await get('/widgets?includeDeleted=0').expect(400);

      const list = await get('/widgets').expect(200);
      const ids = list.body.data.map((row: { id: string }) => row.id);
      expect(ids).toContain(kept);
      expect(ids).not.toContain(removed);
      await get(`/widgets/${removed}`).expect(404);
    });

    it('returns deleted rows on a route that opted in', async () => {
      const removed = await create('archive', 'removed');
      await request(app.getHttpServer())
        .delete(`/archive/${removed}`)
        .set('Authorization', 'Bearer u1');

      const without = await get('/archive').expect(200);
      expect(
        without.body.data.map((row: { id: string }) => row.id),
      ).not.toContain(removed);

      const withDeleted = await get('/archive?includeDeleted=1').expect(200);
      expect(
        withDeleted.body.data.map((row: { id: string }) => row.id),
      ).toContain(removed);
      await get(`/archive/${removed}?includeDeleted=1`).expect(200);
    });

    it('refuses the bracketed forms upstream also reads', async () => {
      const removed = await create('widgets', 'bracketed');
      await request(app.getHttpServer())
        .delete(`/widgets/${removed}`)
        .set('Authorization', 'Bearer u1');

      await get('/widgets?includeDeleted[]=1').expect(400);
      await get('/widgets?includeDeleted[x]=1').expect(400);
      await get(`/widgets/${removed}?includeDeleted%5B%5D=1`).expect(400);
    });

    it('refuses it on update, replace and delete, so a soft-deleted row cannot be edited or destroyed', async () => {
      const removed = await create('widgets', 'untouchable');
      await request(app.getHttpServer())
        .delete(`/widgets/${removed}`)
        .set('Authorization', 'Bearer u1');

      const auth = { Authorization: 'Bearer u1' };
      await request(app.getHttpServer())
        .patch(`/widgets/${removed}?includeDeleted=1`)
        .set(auth)
        .send({ name: 'edited' })
        .expect(400);
      await request(app.getHttpServer())
        .put(`/widgets/${removed}?includeDeleted=1`)
        .set(auth)
        .send({ name: 'replaced' })
        .expect(400);
      await request(app.getHttpServer())
        .delete(`/widgets/${removed}?includeDeleted=1`)
        .set(auth)
        .expect(400);

      // The hard-delete case is the destructive one: upstream would find the
      // soft-deleted row through the parameter and remove it permanently.
      // Seeded through the repository without `ctx`: this entity has no
      // hooks, and the seed is not what is under test.
      const hardRepo = app.get<RepositoryInterface<HardEntity>>(
        getDynamicRepositoryToken('hard'),
      );
      const seeded = await hardRepo.create({ name: 'soft-deleted' });
      await hardRepo.softDelete(seeded);

      await request(app.getHttpServer())
        .delete(`/hard/${seeded.id}?includeDeleted=1`)
        .set(auth)
        .expect(400);
      await expect(
        hardRepo.findOne({
          where: Where.eq<HardEntity>('id', seeded.id),
          withDeleted: true,
        }),
      ).resolves.not.toBeNull();
    });
  });

  describe('list limits', () => {
    it('caps a list at 100 rows by default, even when a bigger limit is asked', async () => {
      await seed('widget', 105, 'bulk');

      const plain = await get('/widgets').expect(200);
      expect(plain.body.data).toHaveLength(100);
      expect(plain.body.total).toBeGreaterThan(100);

      const asked = await get('/widgets?limit=500').expect(200);
      expect(asked.body.data).toHaveLength(100);

      const smaller = await get('/widgets?limit=5').expect(200);
      expect(smaller.body.data).toHaveLength(5);
    });

    it('uses the operation page size and clamps to its own maxLimit', async () => {
      await seed('paged', 30, 'row');

      const plain = await get('/paged').expect(200);
      expect(plain.body.data).toHaveLength(10);

      const asked = await get('/paged?limit=50').expect(200);
      expect(asked.body.data).toHaveLength(20);
    });
  });

  describe('operation decorators', () => {
    it('let a CrudMaxLimit in the operation decorators replace the default cap', async () => {
      await seed('decorated', 5, 'row');

      const plain = await get('/decorated').expect(200);
      expect(plain.body.data).toHaveLength(3);
    });
  });

  describe('definition-time checks', () => {
    const define = (operations: Record<string, unknown>) => () =>
      defineResource<PagedEntity>({
        key: 'bad',
        entity: PagedEntity,
        path: 'bad',
        operations: {
          list: { output: responseSchema },
          read: { output: responseSchema },
          create: { input: createSchema, output: responseSchema },
          ...operations,
        },
      });

    it('rejects includeDeleted on an operation that returns no rows', () => {
      expect(
        define({
          create: {
            input: createSchema,
            output: responseSchema,
            includeDeleted: true,
          },
        }),
      ).toThrow(/includeDeleted/);
    });

    it('rejects limit options anywhere but list', () => {
      expect(define({ read: { output: responseSchema, limit: 5 } })).toThrow(
        /only honored on list/,
      );
    });

    it('rejects a non-positive or fractional limit', () => {
      expect(define({ list: { output: responseSchema, limit: 0 } })).toThrow(
        /positive integer/,
      );
      expect(
        define({ list: { output: responseSchema, maxLimit: 2.5 } }),
      ).toThrow(/positive integer/);
    });

    it('rejects a page size above the cap, naming the default when it applies', () => {
      expect(
        define({ list: { output: responseSchema, limit: 30, maxLimit: 20 } }),
      ).toThrow(/exceeds maxLimit \(20\)/);
      expect(define({ list: { output: responseSchema, limit: 150 } })).toThrow(
        /exceeds maxLimit \(100\) — the default/,
      );
    });
  });
});
