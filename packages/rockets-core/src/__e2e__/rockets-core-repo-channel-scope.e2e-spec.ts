/**
 * `find`, `count`, `upsert` and `createMany` are contract methods a service
 * calls directly. Until the hook surface exposed their channels, a call
 * forwarding `ctx` still came back unscoped — the generated list route was
 * filtered and the hand-written query beside it was not. The write pair had
 * the same shape: rows written with no owner stamped.
 *
 * The seam probed here is the documented one: a custom CRUD handler for the
 * entity, which receives that entity's own CRUD context and forwards it to
 * the entity's repository. The hook list rides on the context, so this is
 * exactly the reach the documentation claims — no more. A call into ANOTHER
 * entity's repository inherits this context's hook list, not that entity's,
 * and is deliberately outside the claim.
 *
 * Reads are probed on the list handler and writes on the create handler: a
 * write inside the read path would change what the next read observes.
 */
import { randomUUID } from 'node:crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  INestApplication,
  Injectable,
  UnauthorizedException,
  type PlainLiteralObject,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import { withOpenApi } from '@concepta/nestjs-core';
import {
  CrudAdapter,
  CrudCreateCommand,
  CrudCreateHandler,
  CrudListHandler,
  type CrudListQuery,
  type CrudResponsePaginatedInterface,
} from '@concepta/nestjs-crud';
import type { RepositoryInterface } from '@concepta/nestjs-repository';
import request from 'supertest';
import { z } from 'zod';

import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import { InjectCrudAdapter, InjectDynamicRepository } from '../common';
import { extractBearerToken } from '../infrastructure/auth/extract-bearer-token';
import { RocketsCoreModule } from '../rockets-core.module';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { defineResource } from '../infrastructure/resource/define-resource';
import { defineHook } from '../infrastructure/hooks/define-hook';
import { OwnerScopeHook } from '../infrastructure/hooks/owner-scope.hook';
import { OwnerStampHook } from '../infrastructure/hooks/owner-stamp.hook';

@Entity('channel_notes')
class NoteEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) body!: string;
  @Column({ type: 'varchar' }) userId!: string;
}

/** What the handlers observed on the last request, for the test to assert. */
const observed: {
  readOwners: string[];
  count: number;
  createdOwners: string[];
  upsertedOwner: string | null;
} = { readOwners: [], count: 0, createdOwners: [], upsertedOwner: null };

/** Which channels the functional `defineHook` spec actually received. */
const fired = new Set<string>();

const ChannelProbe = defineHook(NoteEntity, {
  beforeFind: (options) => {
    fired.add('beforeFind');
    return options;
  },
  beforeCount: (options) => {
    fired.add('beforeCount');
    return options;
  },
  beforeCreateMany: (payload) => {
    fired.add('beforeCreateMany');
    return payload;
  },
  beforeUpsert: (payload) => {
    fired.add('beforeUpsert');
    return payload;
  },
});

/** The hand-written read the documentation talks about, on the list seam. */
@Injectable()
class NoteListHandler extends CrudListHandler<PlainLiteralObject> {
  constructor(
    @InjectCrudAdapter(NoteEntity)
    readonly crudAdapter: CrudAdapter<PlainLiteralObject>,
    @InjectDynamicRepository(NoteEntity)
    private readonly notes: RepositoryInterface<NoteEntity>,
  ) {
    super(crudAdapter);
  }

  override async execute(
    query: CrudListQuery<PlainLiteralObject>,
  ): Promise<CrudResponsePaginatedInterface<PlainLiteralObject>> {
    const { context } = query;
    const rows = await this.notes.find({ ctx: context });
    observed.readOwners = rows.map((row) => row.userId);
    observed.count = await this.notes.count({ ctx: context });
    return super.execute(query);
  }
}

/** The hand-written writes, on the create seam. */
@Injectable()
class NoteCreateHandler extends CrudCreateHandler<PlainLiteralObject> {
  constructor(
    @InjectCrudAdapter(NoteEntity)
    readonly crudAdapter: CrudAdapter<PlainLiteralObject>,
    @InjectDynamicRepository(NoteEntity)
    private readonly notes: RepositoryInterface<NoteEntity>,
  ) {
    super(crudAdapter);
  }

  override async execute(
    command: CrudCreateCommand<PlainLiteralObject>,
  ): Promise<PlainLiteralObject> {
    const { context } = command;

    const many = await this.notes.createMany(
      [{ body: 'from createMany' } as NoteEntity],
      { ctx: context },
    );
    observed.createdOwners = many.map((row) => row.userId);

    // `upsert` conflicts on the primary key, so the id is the caller's to
    // provide — an upsert without one throws by contract.
    const one = await this.notes.upsert(
      { id: randomUUID(), body: 'from upsert' } as NoteEntity,
      { ctx: context },
    );
    observed.upsertedOwner = one?.userId ?? null;

    return super.execute(command);
  }
}

const noteResponseSchema = withOpenApi(
  z.object({ id: z.uuid(), body: z.string(), userId: z.string() }),
  'ChannelNoteResponseDto',
);

@Injectable()
class TwoUserAdapter implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(request);
    if (token === null) return { matched: false };
    if (token === 'u1' || token === 'u2') {
      return { matched: true, user: { id: token, sub: token } };
    }
    return { matched: true, error: new UnauthorizedException() };
  }
}

describe('repository channels are scoped and stamped (e2e)', () => {
  let app: INestApplication;

  const post = (token: string, body: object) =>
    request(app.getHttpServer())
      .post('/channel-notes')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  const get = (token: string) =>
    request(app.getHttpServer())
      .get('/channel-notes')
      .set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [NoteEntity],
          synchronize: true,
          dropSchema: true,
        }),
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(TwoUserAdapter),
          providers: [TwoUserAdapter],
          repository: TypeOrmRepositoryModule,
          resources: [
            defineResource<NoteEntity>({
              entity: NoteEntity,
              path: 'channel-notes',
              hooks: [
                OwnerStampHook.for(NoteEntity),
                OwnerScopeHook.for(NoteEntity),
                ChannelProbe,
              ],
              operations: {
                list: { output: noteResponseSchema, handler: NoteListHandler },
                create: {
                  input: withOpenApi(
                    z.object({ body: z.string() }),
                    'ChannelNoteCreateDto',
                  ),
                  output: noteResponseSchema,
                  handler: NoteCreateHandler,
                },
              },
            }),
          ],
          global: true,
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('stamps the actor on a direct createMany and upsert', async () => {
    const created = await post('u1', { body: 'mine' });
    expect(created.status, JSON.stringify(created.body)).toBe(201);

    expect(observed.createdOwners).toEqual(['u1']);
    expect(observed.upsertedOwner).toBe('u1');
  });

  it('scopes a direct find and count to the actor', async () => {
    const theirs = await post('u2', { body: 'theirs' });
    expect(theirs.status, JSON.stringify(theirs.body)).toBe(201);

    await get('u1').expect(200);
    const u1Owners = [...new Set(observed.readOwners)];
    const u1Rows = observed.readOwners.length;
    const u1Count = observed.count;

    await get('u2').expect(200);
    const u2Owners = [...new Set(observed.readOwners)];

    // Each caller's hand-written `find` sees only its own rows, `count`
    // agrees with it, and the rows it did not see do exist — the other
    // caller reads them.
    expect(u1Owners).toEqual(['u1']);
    expect(u2Owners).toEqual(['u2']);
    expect(u1Count).toBe(u1Rows);
    expect(observed.readOwners.length).toBeGreaterThan(0);
  });

  it('delivers all four channels to a functional hook spec', () => {
    expect([...fired].sort()).toEqual([
      'beforeCount',
      'beforeCreateMany',
      'beforeFind',
      'beforeUpsert',
    ]);
  });

  it('keeps the generated route scoped as before', async () => {
    const mine = await get('u1').expect(200);
    const owners = new Set(
      (mine.body.data as Array<{ userId: string }>).map((row) => row.userId),
    );
    expect([...owners]).toEqual(['u1']);
  });
});
