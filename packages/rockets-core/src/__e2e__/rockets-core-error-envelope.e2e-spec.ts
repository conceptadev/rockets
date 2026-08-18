/**
 * E2E coverage for the pluggable error envelope (issue #55).
 *
 * The filter hardcoded `{ statusCode, errorCode, message, timestamp }`,
 * so an app with its own envelope had to re-implement the whole filter —
 * including the `context.originalError` unwrap chain. Miss that chain and
 * every hook `409` becomes a `500`, which is exactly the regression the
 * fork was supposed to avoid.
 *
 * These specs pin both halves:
 *
 *  1. A custom serializer changes the BODY and nothing else — the hook
 *     `409` is still a `409`, and validation still flattens to `400`.
 *  2. Without a serializer the legacy envelope is byte-shape identical.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  ConflictException,
  Global,
  INestApplication,
  Injectable,
  Module,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import { getDynamicRepositoryToken, Where } from '@concepta/nestjs-repository';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import request from 'supertest';
import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import { extractBearerToken } from '../infrastructure/auth/extract-bearer-token';
import { RocketsCoreModule } from '../rockets-core.module';
import { USER_METADATA_MODULE_ENTITY_KEY } from '../rockets-core.constants';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { RocketsCoreExceptionsFilter } from '../infrastructure/filters/exceptions.filter';
import {
  defaultErrorSerializer,
  ROCKETS_ERROR_SERIALIZER_TOKEN,
  type RocketsErrorContext,
  type RocketsErrorSerializerInterface,
} from '../infrastructure/filters/error-serializer';
import { defineResource } from '../infrastructure/resource/define-resource';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { defineHook } from '../infrastructure/hooks/define-hook';

// ── Fixtures ──

@Injectable()
class StubAuthAdapter implements AuthAdapterInterface {
  async authenticate(req: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(req);
    if (token === null) return { matched: false };
    if (token === 'u1') return { matched: true, user: { id: 'u1', sub: 'u1' } };
    return { matched: true, error: new UnauthorizedException() };
  }
}

@Entity('envelope_notes')
class NoteEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) ref!: string;
}

class NoteCreateDto {
  @Expose() @IsString() @ApiProperty() ref!: string;
}
class NoteResponseDto {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() ref!: string;
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

/**
 * Rejects a duplicate `ref` with a `ConflictException` raised INSIDE a
 * repository hook — the path that reaches the filter wrapped in the
 * repository/CRUD chain, which is what a naive envelope fork loses.
 */
const NoteUniqueHook = defineHook<NoteEntity>(NoteEntity, {
  async beforeCreate(payload, ctx, { repo }) {
    const ref = typeof payload.ref === 'string' ? payload.ref : '';
    const existing = await repo.findOne({
      where: Where.eq<NoteEntity>('ref', ref),
      ctx,
    });
    if (existing) throw new ConflictException(`ref "${ref}" is already taken`);
    return payload;
  },
});

const noteResource = defineResource<NoteEntity>({
  key: 'note',
  entity: NoteEntity,
  path: 'notes',
  tags: ['Notes'],
  hooks: [NoteUniqueHook],
  operations: {
    read: { output: NoteResponseDto },
    create: { input: NoteCreateDto, output: NoteResponseDto },
  },
});

/** An app envelope that shares no keys with the Rockets default. */
class TicketEnvelopeSerializer implements RocketsErrorSerializerInterface {
  serialize({ statusCode, errorCode, message }: RocketsErrorContext): unknown {
    return {
      ok: false,
      error: { kind: errorCode, detail: message },
      http: statusCode,
    };
  }
}

async function bootstrap(
  serializer: RocketsErrorSerializerInterface | undefined,
): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [NoteEntity],
        synchronize: true,
        dropSchema: true,
      }),
      MetaModule,
      RocketsCoreModule.forRoot({
        auth: defineAuthAdapter(StubAuthAdapter),
        providers: [StubAuthAdapter],
        repository: TypeOrmRepositoryModule,
        resources: [noteResource],
        global: true,
      }),
    ],
    providers: [
      { provide: APP_GUARD, useClass: AuthServerGuard },
      { provide: APP_FILTER, useClass: RocketsCoreExceptionsFilter },
      ...(serializer
        ? [{ provide: ROCKETS_ERROR_SERIALIZER_TOKEN, useValue: serializer }]
        : []),
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

// ── Specs ──

describe('custom error envelope via ROCKETS_ERROR_SERIALIZER_TOKEN (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootstrap(new TicketEnvelopeSerializer());
    await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', 'Bearer u1')
      .send({ ref: 'taken' })
      .expect(201);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('keeps a hook ConflictException at 409 and shapes the body', async () => {
    const res = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', 'Bearer u1')
      .send({ ref: 'taken' })
      .expect(409);

    expect(res.body).toEqual({
      ok: false,
      error: { kind: expect.any(String), detail: expect.anything() },
      http: 409,
    });
    // The default keys must be gone, not merged alongside.
    expect(res.body.statusCode).toBeUndefined();
    expect(res.body.timestamp).toBeUndefined();
  });

  it('shapes validation failures and keeps them at 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', 'Bearer u1')
      .send({ ref: 42 })
      .expect(400);

    expect(res.body.http).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it('shapes an unauthenticated request and keeps it at 401', async () => {
    const res = await request(app.getHttpServer())
      .get('/notes/00000000-0000-0000-0000-000000000000')
      .expect(401);

    expect(res.body.http).toBe(401);
  });
});

describe('default error envelope is unchanged (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootstrap(undefined);
    await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', 'Bearer u1')
      .send({ ref: 'taken' })
      .expect(201);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('replies with the legacy four-key envelope', async () => {
    const res = await request(app.getHttpServer())
      .post('/notes')
      .set('Authorization', 'Bearer u1')
      .send({ ref: 'taken' })
      .expect(409);

    expect(Object.keys(res.body).sort()).toEqual([
      'errorCode',
      'message',
      'statusCode',
      'timestamp',
    ]);
    expect(res.body.statusCode).toBe(409);
  });

  it('exports the default serializer so an envelope can extend it', () => {
    const body = defaultErrorSerializer.serialize({
      statusCode: 418,
      errorCode: 'TEAPOT',
      message: 'short and stout',
      exception: new ConflictException(),
      originalException: new Error('wrapped by the repository membrane'),
    }) as Record<string, unknown>;

    expect(body.statusCode).toBe(418);
    expect(body.errorCode).toBe('TEAPOT');
    expect(typeof body.timestamp).toBe('string');
  });
});
