/**
 * `If-Match` on generated CRUD routes (`@concepta/nestjs-crud`
 * 8.0.0-alpha.12).
 *
 * Every mutating route parses the header into the repository's
 * `expectedVersion`, so a client that read version N is refused instead
 * of overwriting someone else's N+1. Three properties are easy to get
 * wrong and are pinned here:
 *
 * - the header is OPTIONAL by default, and `requireVersion: true` makes
 *   it mandatory (428) — including against `If-Match: *`, which names no
 *   version;
 * - a resource whose schema carries no `f.version()` REJECTS the header
 *   with a 400. It is not ignored, so the OpenAPI parameter appearing on
 *   such a route is a trap the docs have to name;
 * - `requireVersion` on an operation that reads no precondition
 *   (`list`/`read`/`create`) fails at definition time rather than being
 *   accepted and never run.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  Global,
  INestApplication,
  Injectable,
  Module,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import { getDynamicRepositoryToken } from '@concepta/nestjs-repository';
import request from 'supertest';
import { z } from 'zod';
import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import { extractBearerToken } from '../infrastructure/auth/extract-bearer-token';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { RocketsCoreModule } from '../rockets-core.module';
import { USER_METADATA_MODULE_ENTITY_KEY } from '../rockets-core.constants';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { f, zodResource } from '../zod';

@Injectable()
class StubAuthAdapter implements AuthAdapterInterface {
  async authenticate(req: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(req);
    if (token === null) return { matched: false };
    if (token === 'u1') return { matched: true, user: { id: 'u1', sub: 'u1' } };
    return { matched: true, error: new UnauthorizedException() };
  }
}

class StubMetadataRepo {
  async findOne() {
    return null;
  }
  async create(data: Record<string, unknown>) {
    return { id: '1', ...data };
  }
  async update(e: Record<string, unknown>, d: Record<string, unknown>) {
    return { ...e, ...d };
  }
}

const metaToken = getDynamicRepositoryToken(USER_METADATA_MODULE_ENTITY_KEY);

@Global()
@Module({
  providers: [{ provide: metaToken, useValue: new StubMetadataRepo() }],
  exports: [metaToken],
})
class MetaModule {}

@Entity('if_match_widgets')
class WidgetEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  @VersionColumn() version!: number;
}

@Entity('if_match_strict')
class StrictEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  @VersionColumn() version!: number;
}

/** No version column at all — the header has nothing to compare against. */
@Entity('if_match_plain')
class PlainEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
}

const widgetResource = zodResource({
  name: 'IfMatchWidget',
  schema: z.object({ id: f.pk(), name: f.string(), version: f.version() }),
  entity: WidgetEntity,
  path: 'if-match-widgets',
  tags: ['IfMatchWidgets'],
  operations: ['read', 'create', 'update', 'replace', 'delete'],
});

/** Same shape, `requireVersion: true` on the update route. */
const strictResource = zodResource({
  name: 'IfMatchStrict',
  schema: z.object({ id: f.pk(), name: f.string(), version: f.version() }),
  entity: StrictEntity,
  path: 'if-match-strict',
  tags: ['IfMatchStrict'],
  operations: {
    read: true,
    create: true,
    update: { requireVersion: true },
  },
});

const plainResource = zodResource({
  name: 'IfMatchPlain',
  schema: z.object({ id: f.pk(), name: f.string() }),
  entity: PlainEntity,
  path: 'if-match-plain',
  tags: ['IfMatchPlain'],
  operations: ['read', 'create', 'update'],
});

describe('If-Match on generated CRUD routes (e2e)', () => {
  let app: INestApplication;

  const create = async (path: string): Promise<Record<string, unknown>> => {
    const res = await request(app.getHttpServer())
      .post(`/${path}`)
      .set('Authorization', 'Bearer u1')
      .send({ name: 'first' })
      .expect(201);
    return res.body;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [WidgetEntity, StrictEntity, PlainEntity],
          synchronize: true,
          dropSchema: true,
        }),
        MetaModule,
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(StubAuthAdapter),
          providers: [StubAuthAdapter],
          repository: TypeOrmRepositoryModule,
          resources: [widgetResource, strictResource, plainResource],
          global: true,
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('writes without the header, exactly as before', async () => {
    const row = await create('if-match-widgets');
    await request(app.getHttpServer())
      .patch(`/if-match-widgets/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .send({ name: 'second' })
      .expect(200);
  });

  it('refuses a stale version and leaves the row alone', async () => {
    const row = await create('if-match-widgets');

    const conflict = await request(app.getHttpServer())
      .patch(`/if-match-widgets/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .set('If-Match', '"0"')
      .send({ name: 'stale' })
      .expect(409);
    expect(conflict.body.errorCode).toBe('OPTIMISTIC_LOCK_CONFLICT');

    const after = await request(app.getHttpServer())
      .get(`/if-match-widgets/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .expect(200);
    expect(after.body.name).toBe('first');
  });

  it('accepts the current version and bumps it', async () => {
    const row = await create('if-match-widgets');

    await request(app.getHttpServer())
      .patch(`/if-match-widgets/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .set('If-Match', `"${row.version}"`)
      .send({ name: 'second' })
      .expect(200);

    const after = await request(app.getHttpServer())
      .get(`/if-match-widgets/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .expect(200);
    expect(after.body.name).toBe('second');
    expect(after.body.version).toBe(Number(row.version) + 1);
  });

  // `requireVersion: true` — the header stops being optional.
  it('demands a version when the operation requires one', async () => {
    const row = await create('if-match-strict');

    const missing = await request(app.getHttpServer())
      .patch(`/if-match-strict/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .send({ name: 'second' })
      .expect(428);
    expect(missing.body.errorCode).toBe('CRUD_PRECONDITION_REQUIRED');

    // `*` matches any version, so it names none — it does not satisfy the
    // requirement, which is the whole point of turning the flag on.
    await request(app.getHttpServer())
      .patch(`/if-match-strict/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .set('If-Match', '*')
      .send({ name: 'second' })
      .expect(428);

    await request(app.getHttpServer())
      .patch(`/if-match-strict/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .set('If-Match', `"${row.version}"`)
      .send({ name: 'second' })
      .expect(200);
  });

  // The trap: OpenAPI documents `If-Match` on every mutating route,
  // including resources with no version column — where sending it is a
  // hard 400, not a no-op.
  it('rejects the header on a resource with no version column', async () => {
    const row = await create('if-match-plain');

    await request(app.getHttpServer())
      .patch(`/if-match-plain/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .set('If-Match', '"1"')
      .send({ name: 'second' })
      .expect(400);

    await request(app.getHttpServer())
      .patch(`/if-match-plain/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .send({ name: 'second' })
      .expect(200);
  });

  // The header is read on every mutating verb, not just PATCH.
  it('guards replace and delete the same way', async () => {
    const row = await create('if-match-widgets');

    await request(app.getHttpServer())
      .put(`/if-match-widgets/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .set('If-Match', '"0"')
      .send({ name: 'stale' })
      .expect(409);

    await request(app.getHttpServer())
      .put(`/if-match-widgets/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .set('If-Match', `"${row.version}"`)
      .send({ name: 'replaced' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/if-match-widgets/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .set('If-Match', '"0"')
      .expect(409);

    await request(app.getHttpServer())
      .get(`/if-match-widgets/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .expect(200);
  });

  it('rejects a malformed header instead of ignoring it', async () => {
    const row = await create('if-match-widgets');

    await request(app.getHttpServer())
      .patch(`/if-match-widgets/${row.id}`)
      .set('Authorization', 'Bearer u1')
      .set('If-Match', 'not-an-etag')
      .send({ name: 'second' })
      .expect(400);
  });

  it('refuses requireVersion on an operation that reads no precondition', () => {
    expect(() =>
      zodResource({
        name: 'IfMatchBadOp',
        schema: z.object({ id: f.pk(), name: f.string() }),
        entity: PlainEntity,
        path: 'if-match-bad',
        operations: { create: { requireVersion: true } },
      }),
    ).toThrow(/requireVersion/);
  });
});
