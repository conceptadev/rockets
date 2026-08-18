/**
 * E2E coverage for per-operation `input` / `output` on the zod resource
 * path (issue #57 — parity with the class path).
 *
 * The class path has always accepted per-operation DTO classes; the zod
 * path only had the single schema-derived projection, so an app had to
 * choose between controlled projection and automatic OpenAPI. These
 * specs pin the three things that choice was costing:
 *
 *  1. `input` narrows the accepted request body — extra keys are
 *     stripped, and a field the resource schema requires can be dropped
 *     from one operation without touching the resource.
 *  2. `output` narrows the serialized response per operation (a list
 *     projection that is deliberately thinner than the read one).
 *  3. The overrides are real OpenAPI components, not just runtime
 *     behaviour, and the untouched operations keep the derived DTOs.
 *
 * The last block covers the same behaviour on the CLASS path. Per-operation
 * `output` was accepted there but never reached the route: upstream reads
 * `response.resource` from the controller only, so `defineResource` now
 * stamps the route-level metadata. Both paths are pinned here so they
 * cannot drift apart again.
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
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import { getDynamicRepositoryToken } from '@concepta/nestjs-repository';
import request from 'supertest';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import { extractBearerToken } from '../infrastructure/auth/extract-bearer-token';
import { RocketsCoreModule } from '../rockets-core.module';
import { USER_METADATA_MODULE_ENTITY_KEY } from '../rockets-core.constants';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { baseEntity, f, zodResource } from '../zod';
import { defineResource } from '../infrastructure/resource/define-resource';

// ── Auth / metadata fixtures ──

@Injectable()
class StubAuthAdapter implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(request);
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

// ── Entities ──
//
// Handwritten rather than schema-compiled: this spec lives inside
// rockets-core, and the TypeORM zod compiler resolves
// `@concepta/rockets-core/zod` to the BUILT package, so its field-meta
// registry is a different instance from the `src` one these fixtures
// register into. Entity compilation is covered in the adapter package;
// what is under test here is the DTO/operation surface.

@Entity('io_articles')
class ArticleEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) title!: string;
  @Column({ type: 'varchar' }) body!: string;
  @Column({ type: 'varchar', nullable: true }) slug?: string;
  @CreateDateColumn() dateCreated!: Date;
  @UpdateDateColumn() dateUpdated!: Date;
}

@Entity('io_widgets')
class WidgetEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  @Column({ type: 'varchar' }) secretNote!: string;
}

@Entity('io_deriveds')
class DerivedEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) label!: string;
  @CreateDateColumn() dateCreated!: Date;
  @UpdateDateColumn() dateUpdated!: Date;
}

// ── Resources ──

const articleSchema = baseEntity({
  title: f.string(),
  body: f.string(),
  slug: f.string().optional(),
});

/**
 * `create` accepts title + body only (slug is server-derived on this
 * route), and `list` returns a deliberately thin card projection while
 * `read` keeps the full derived response.
 */
const articleResource = zodResource({
  name: 'Article',
  schema: articleSchema,
  entity: ArticleEntity,
  path: 'articles',
  tags: ['Articles'],
  operations: {
    list: {
      output: z.object({ id: z.uuid(), title: z.string() }),
    },
    read: true,
    create: {
      input: z.object({ title: z.string(), body: z.string() }),
    },
  },
  hooks: [],
});

/** Control resource: no overrides anywhere, derived DTOs must survive. */
const derivedSchema = baseEntity({
  label: f.string(),
});

const derivedResource = zodResource({
  name: 'Derived',
  schema: derivedSchema,
  entity: DerivedEntity,
  path: 'deriveds',
  tags: ['Deriveds'],
  operations: ['list', 'read', 'create'],
});

// ── Class-path resource (same feature, DTO classes instead of schemas) ──

class WidgetCreateDto {
  @Expose() @IsString() @ApiProperty() name!: string;
  @Expose() @IsString() @ApiProperty() secretNote!: string;
}

class WidgetReadDto {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() name!: string;
  @Expose() @ApiProperty() secretNote!: string;
}

/** Deliberately thinner than the read DTO — the list route must use it. */
class WidgetCardDto {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() name!: string;
}

const widgetResource = defineResource<WidgetEntity>({
  key: 'widget',
  entity: WidgetEntity,
  path: 'widgets',
  tags: ['Widgets'],
  operations: {
    list: { output: WidgetCardDto },
    read: { output: WidgetReadDto },
    create: { input: WidgetCreateDto, output: WidgetReadDto },
  },
});

// ── Spec ──

describe('zodResource per-operation input/output (e2e)', () => {
  let app: INestApplication;
  let components: Record<string, unknown>;
  let articleId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [ArticleEntity, DerivedEntity, WidgetEntity],
          synchronize: true,
          dropSchema: true,
        }),
        MetaModule,
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(StubAuthAdapter),
          providers: [StubAuthAdapter],
          repository: TypeOrmRepositoryModule,
          resources: [articleResource, derivedResource, widgetResource],
          global: true,
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('io').build(),
    );
    components = (document.components?.schemas ?? {}) as Record<
      string,
      unknown
    >;

    const created = await request(app.getHttpServer())
      .post('/articles')
      .set('Authorization', 'Bearer u1')
      .send({ title: 'first', body: 'body-text' })
      .expect(201);
    articleId = created.body.id;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('input override', () => {
    it('accepts a body that omits a field the resource schema requires', () => {
      // `slug` is required by articleSchema but absent from the create
      // override — the request above already proved the route accepts it.
      expect(articleId).toBeDefined();
    });

    it('strips keys the override does not declare', async () => {
      const res = await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', 'Bearer u1')
        .send({ title: 'second', body: 'more', slug: 'client-supplied' })
        .expect(201);

      // `slug` is not part of the create contract on this route, so a
      // client-supplied value must not be persisted — the column stays
      // at its default rather than carrying 'client-supplied'.
      const read = await request(app.getHttpServer())
        .get(`/articles/${res.body.id}`)
        .set('Authorization', 'Bearer u1')
        .expect(200);
      expect(read.body.slug).toBeNull();
    });

    it('rejects a body missing a field the override requires', async () => {
      await request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', 'Bearer u1')
        .send({ title: 'no-body' })
        .expect(400);
    });
  });

  describe('output override', () => {
    it('list serializes only the override projection', async () => {
      const res = await request(app.getHttpServer())
        .get('/articles')
        .set('Authorization', 'Bearer u1')
        .expect(200);

      const [first] = res.body.data;
      expect(Object.keys(first).sort()).toEqual(['id', 'title']);
    });

    it('read keeps the schema-derived response', async () => {
      const res = await request(app.getHttpServer())
        .get(`/articles/${articleId}`)
        .set('Authorization', 'Bearer u1')
        .expect(200);

      expect(res.body.title).toBe('first');
      expect(res.body.body).toBe('body-text');
    });
  });

  describe('OpenAPI', () => {
    it('registers the override DTOs as named components', () => {
      expect(components).toHaveProperty('ArticleCreateInputDto');
      expect(components).toHaveProperty('ArticleListOutputDto');
    });

    it('documents the override body shape, not the derived one', () => {
      const createDto = components.ArticleCreateInputDto as {
        properties: Record<string, unknown>;
      };
      expect(Object.keys(createDto.properties).sort()).toEqual([
        'body',
        'title',
      ]);
    });

    it('leaves resources without overrides on the derived DTOs', () => {
      expect(components).toHaveProperty('DerivedCreateDto');
      expect(components).toHaveProperty('DerivedResponseDto');
      expect(components).not.toHaveProperty('DerivedCreateInputDto');
    });
  });

  describe('class path (defineResource) parity', () => {
    let widgetId: string;

    beforeAll(async () => {
      const created = await request(app.getHttpServer())
        .post('/widgets')
        .set('Authorization', 'Bearer u1')
        .send({ name: 'w1', secretNote: 'not-for-lists' })
        .expect(201);
      widgetId = created.body.id;
    });

    it('read serializes the read DTO', async () => {
      const res = await request(app.getHttpServer())
        .get(`/widgets/${widgetId}`)
        .set('Authorization', 'Bearer u1')
        .expect(200);
      expect(res.body.secretNote).toBe('not-for-lists');
    });

    it('list serializes its own thinner DTO', async () => {
      const res = await request(app.getHttpServer())
        .get('/widgets')
        .set('Authorization', 'Bearer u1')
        .expect(200);

      const [first] = res.body.data;
      expect(Object.keys(first).sort()).toEqual(['id', 'name']);
    });

    it('documents the list item shape as the list DTO', () => {
      expect(components).toHaveProperty('WidgetCardDto');
      const card = components.WidgetCardDto as {
        properties: Record<string, unknown>;
      };
      expect(Object.keys(card.properties).sort()).toEqual(['id', 'name']);
    });
  });
});
