/**
 * Regression for issue #68 — free-form JSON columns emptied on the way out.
 *
 * The module default transform pair is `strategy: 'excludeAll'` +
 * `excludeExtraneousValues: true`. On the way OUT that makes
 * class-transformer walk into a plain object with no per-key `@Expose`
 * metadata and return `{}`: the row persists correctly and the response
 * body loses it, with nothing erroring.
 *
 * The zod path already sidesteps this (`ZOD_TO_PLAIN_OPTIONS` sets
 * `excludeExtraneousValues: false`); the class-DTO path did not.
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
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import { getDynamicRepositoryToken, Where } from '@concepta/nestjs-repository';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { defineResource } from '../infrastructure/resource/define-resource';
// FreeFormJson via the ROOT barrel — the README example imports from
// the package root, and round 4 caught the symbol missing there while
// this spec reached it by deep import, hiding the drift.
import { FreeFormJson } from '../index';
import { f, rocketsFieldMeta, zodResource } from '../zod';
import { z } from 'zod';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import {
  CrudCommandHandlerBase,
  type CrudCommandInterface,
  InjectCrudAdapter,
} from '../index';
import type { CrudAdapter } from '@concepta/nestjs-crud';

@Injectable()
class StubAuthAdapter implements AuthAdapterInterface {
  async authenticate(req: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(req);
    if (token === null) return { matched: false };
    if (token === 'u1') return { matched: true, user: { id: 'u1', sub: 'u1' } };
    return { matched: true, error: new UnauthorizedException() };
  }
}

@Entity('json_pets')
class PetEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  /** Free-form blob: no fixed shape, so no per-key `@Expose` is possible. */
  @Column({ type: 'simple-json', nullable: true })
  profile?: Record<string, unknown>;
  @Column({ type: 'simple-json', nullable: true })
  tags?: unknown[];
  /** Nested projection target — NOT free-form. */
  @Column({ type: 'simple-json', nullable: true })
  vet?: Record<string, unknown>;
  /**
   * Server-owned column, deliberately absent from every input DTO.
   * A vacuous whitelist test uses a key the entity does not have —
   * TypeORM drops that for free and proves nothing. This is a real
   * column, so only the whitelist can keep a client from setting it.
   */
  @Column({ type: 'varchar', nullable: true })
  internalRank?: string;
}

/**
 * Declared with `@Type()`, so a nested projection must still apply:
 * `clinic` survives, `internalNotes` does not. This is the half of the
 * contract that dropping `strategy: 'excludeAll'` could have silently
 * widened.
 */
class VetDto {
  @Expose() @IsString() @ApiProperty() clinic!: string;
}

class PetCreateDto {
  @Expose() @IsString() @ApiProperty() name!: string;
  @Expose()
  @FreeFormJson()
  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  profile?: Record<string, unknown>;
  @Expose()
  @IsOptional()
  @IsArray()
  @Type(() => String)
  @ApiPropertyOptional({ type: [String], isArray: true })
  tags?: unknown[];
  @Expose()
  @IsOptional()
  @Type(() => VetDto)
  @ApiPropertyOptional({ type: VetDto })
  vet?: VetDto;
}

class PetResponseDto {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() name!: string;
  @Expose()
  @FreeFormJson()
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  profile?: Record<string, unknown>;
  // Arrays are not affected — class-transformer copies them through —
  // so this one deliberately carries no marker.
  @Expose()
  @Type(() => String)
  @ApiPropertyOptional({ type: [String], isArray: true })
  tags?: unknown[];
}

/** Same shape without the marker: pins the documented default. */
class PetUnmarkedResponseDto {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() name!: string;
  @Expose()
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  profile?: Record<string, unknown>;
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

@Injectable()
class ProbeCreateHandler extends CrudCommandHandlerBase<PetEntity> {
  constructor(
    @InjectCrudAdapter(PetEntity) crudAdapter: CrudAdapter<PetEntity>,
  ) {
    super(crudAdapter);
  }

  async execute(command: CrudCommandInterface<PetEntity>) {
    const c = command as unknown as { context: unknown; dto?: unknown };
    return this.crudAdapter.create(
      c.context as never,
      c.dto as never,
    ) as Promise<PetEntity>;
  }
}

const petResource = defineResource<PetEntity>({
  key: 'pet',
  entity: PetEntity,
  path: 'pets',
  tags: ['Pets'],
  dto: { response: PetResponseDto },
  operations: {
    list: {},
    read: {},
    create: {
      input: PetCreateDto,
      handler: ProbeCreateHandler,
    },
    // Same row, response DTO without the marker.
    update: { input: PetCreateDto, output: PetUnmarkedResponseDto },
  },
});

// ── Zod counterpart: the issue claims this path already works ──

@Entity('json_zpets')
class ZPetEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  @Column({ type: 'simple-json', nullable: true })
  profile?: Record<string, unknown>;
}

const zpetResource = zodResource({
  name: 'ZPet',
  schema: z.object({
    id: f.pk(),
    name: f.string(),
    // The zod path hides a field from the response unless it opts in —
    // the deliberate CWE-200 rule. A raw `z.record()` carries no meta,
    // so it is correctly absent; this is what declaring it looks like.
    profile: z
      .record(z.string(), z.unknown())
      .register(rocketsFieldMeta, { dto: { response: true } })
      .optional(),
  }),
  entity: ZPetEntity,
  path: 'zpets',
  tags: ['ZPets'],
  operations: ['read', 'create'],
});

const PROFILE = {
  temperament: 'shy',
  vaccines: ['rabies', 'parvo'],
  notes: 'needs a quiet home',
  nested: { level: { deep: true } },
};

describe('class-DTO responses keep free-form JSON columns (e2e)', () => {
  let app: INestApplication;
  let petId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [PetEntity, ZPetEntity],
          synchronize: true,
          dropSchema: true,
        }),
        MetaModule,
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(StubAuthAdapter),
          providers: [StubAuthAdapter],
          repository: TypeOrmRepositoryModule,
          resources: [petResource, zpetResource],
          global: true,
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const created = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', 'Bearer u1')
      .send({ name: 'Rex', profile: PROFILE, tags: ['friendly', 'senior'] })
      .expect(201);
    petId = created.body.id;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('ZOD PATH: returns the blob intact (issue claims this already works)', async () => {
    const created = await request(app.getHttpServer())
      .post('/zpets')
      .set('Authorization', 'Bearer u1')
      .send({ name: 'Zed', profile: PROFILE })
      .expect(201);

    expect(created.body.profile).toEqual(PROFILE);
  });

  it('persists the blob (the write side was never the problem)', async () => {
    const repo = app.get<{
      findOne: (o: unknown) => Promise<PetEntity | null>;
    }>(getDynamicRepositoryToken('pet'));
    const row = await repo.findOne({
      where: Where.eq<PetEntity>('id', petId),
    });
    expect(row?.profile).toEqual(PROFILE);
  });

  // ── The request side must NOT have been widened (#68) ──
  //
  // The fix relaxes the module's outbound transform options. That is
  // only safe if nothing on the way IN got looser with it. These pin
  // the request side independently, so a future edit to the transform
  // options cannot quietly open mass assignment: without them the
  // change reads as "relaxed serialization until something leaks".

  it('still drops an undeclared top-level key on the way in', async () => {
    const created = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', 'Bearer u1')
      .send({ name: 'Whitelist', profile: PROFILE, internalRank: 'platinum' })
      .expect(201);

    const repo = app.get<{
      findOne: (o: unknown) => Promise<PetEntity | null>;
    }>(getDynamicRepositoryToken('pet'));
    const row = await repo.findOne({
      where: Where.eq<PetEntity>('id', created.body.id),
    });

    // Asserted on the ROW, not the response: a key stripped only on the
    // way out would still have been written.
    expect(row?.internalRank).toBeNull();
    expect(row?.profile).toEqual(PROFILE);
  });

  it('still projects a nested @Type() property to the child exposed fields', async () => {
    const created = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', 'Bearer u1')
      .send({
        name: 'Nested',
        vet: { clinic: 'North Road', internalNotes: 'do not disclose' },
      })
      .expect(201);

    const repo = app.get<{
      findOne: (o: unknown) => Promise<PetEntity | null>;
    }>(getDynamicRepositoryToken('pet'));
    const row = await repo.findOne({
      where: Where.eq<PetEntity>('id', created.body.id),
    });

    expect(row?.vet).toEqual({ clinic: 'North Road' });
  });

  it('returns the blob intact on create', async () => {
    const res = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', 'Bearer u1')
      .send({ name: 'Bella', profile: PROFILE })
      .expect(201);

    expect(res.body.profile).toEqual(PROFILE);
  });

  it('returns the blob intact on read', async () => {
    const res = await request(app.getHttpServer())
      .get(`/pets/${petId}`)
      .set('Authorization', 'Bearer u1')
      .expect(200);

    expect(res.body.profile).toEqual(PROFILE);
    expect(res.body.tags).toEqual(['friendly', 'senior']);
  });

  it('returns the blob intact on list', async () => {
    const res = await request(app.getHttpServer())
      .get('/pets')
      .set('Authorization', 'Bearer u1')
      .expect(200);

    const rex = (res.body.data as PetEntity[]).find((p) => p.name === 'Rex');
    expect(rex?.profile).toEqual(PROFILE);
  });

  it('an UNMARKED response property projects to empty — the marker is required on both sides', async () => {
    // The first revision asserted the opposite ("only input needs the
    // marker") — which required dropping `strategy: 'excludeAll'`
    // globally, and THAT emitted every `@Expose`d nested relation
    // without `@Type()` verbatim: `owner: { passwordHash }` where the
    // projection previously yielded `{}`. Clean-room review caught the
    // leak. The safe contract: free-form values need `@FreeFormJson` on
    // the response DTO too; an unmarked object projects to `{}`.
    const res = await request(app.getHttpServer())
      .patch(`/pets/${petId}`)
      .set('Authorization', 'Bearer u1')
      .send({ name: 'Rex' })
      .expect(200);

    expect(res.body.profile).toEqual({});
  });

  it('still strips a column the response DTO does not declare', async () => {
    const res = await request(app.getHttpServer())
      .get(`/pets/${petId}`)
      .set('Authorization', 'Bearer u1')
      .expect(200);

    // The whole point of the projection must survive the fix: this is
    // the property that keeps `dto: { response: false }` meaningful.
    expect(Object.keys(res.body).sort()).toEqual([
      'id',
      'name',
      'profile',
      'tags',
    ]);
  });
});
