import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { DynamicModule } from '@nestjs/common';
import {
  Inject,
  INestApplication,
  Injectable,
  Module,
  SetMetadata,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD, REQUEST } from '@nestjs/core';
import {
  ApiProperty,
  ApiPropertyOptional,
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { z } from 'zod';
import request from 'supertest';

import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import { extractBearerToken } from '../infrastructure/auth/extract-bearer-token';
import { RocketsCoreModule } from '../rockets-core.module';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { defineOperationResource } from '../infrastructure/resource/define-operation-resource';
import { operationResource } from '../zod/zod-operation-resource';
import type { OperationContext } from '../domain/interfaces/operation-resource.interface';

const OPS_MARK = 'ops:mark';
const LOCAL_VALUE = 'operation-resource-local-value';
const Mark = () => SetMetadata(OPS_MARK, true);

@Injectable()
class SimpleAuthProvider implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(request);
    if (token === null) return { matched: false };
    if (token === 'ok') {
      return { matched: true, user: { id: 'u1', sub: 'u1' } };
    }
    return { matched: true, error: new UnauthorizedException() };
  }
}

@Injectable()
class ShoutHandler {
  handle(ctx: OperationContext<{ text: string }>): {
    text: string;
    secret: string;
  } {
    return { text: ctx.input.text.toUpperCase(), secret: 'leak-me' };
  }
}

@Injectable()
class ClassFieldHandler {
  readonly handle = (): { ok: boolean } => ({ ok: true });
}

@Injectable()
class LocalValueHandler {
  constructor(@Inject(LOCAL_VALUE) private readonly value: string) {}

  handle(): { value: string } {
    return { value: this.value };
  }
}

@Injectable({ scope: Scope.REQUEST })
class RequestScopedHandler {
  handle(): { scoped: boolean } {
    return { scoped: true };
  }
}

@Injectable()
class ReplacedHandler {
  handle(): { source: string } {
    return { source: 'class' };
  }
}

class LowerInputDto {
  @ApiProperty()
  @IsString()
  name!: string;
}

/**
 * All-optional on purpose. A required field would 400 on its own, so it
 * could not show that a non-record body was being coerced to `{}` and
 * accepted.
 */
class LowerOptionalInputDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

class LowerChildDto {
  @ApiProperty()
  @IsString()
  street!: string;
}

/** Nested class-validator shape: constraints live in error.children. */
class LowerNestedInputDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ type: LowerChildDto })
  @ValidateNested()
  @Type(() => LowerChildDto)
  child!: LowerChildDto;
}

class LowerOutputDto {
  @ApiProperty()
  @IsString()
  name!: string;
}

const ItemSchema = z.object({ id: z.string() });
type Item = z.infer<typeof ItemSchema>;

const publicOps = operationResource({
  path: 'ops',
  tags: ['Ops'],
  public: true,
  operations: (op) => ({
    ping: op.read({
      path: '',
      summary: 'Health ping',
      output: z.object({ ok: z.boolean() }),
      handler: () => ({ ok: true, internal: true }),
    }),
    items: op.read({
      output: z.array(ItemSchema),
      handler: (): Array<Item & { extra?: boolean }> => [
        { id: 'a' },
        { id: 'b', extra: true },
      ],
    }),
    broken: op.read({
      output: z.object({ ok: z.literal(true) }),
      // Intentional runtime contract break for the 500 assertion below.
      handler: (): { ok: true } => ({ ok: false as unknown as true }),
    }),
    voidish: op.read({
      output: z.object({ ok: z.boolean() }),
      // Intentional runtime contract break for the 500 assertion below.
      handler: (): { ok: boolean } => undefined as unknown as { ok: boolean },
    }),
    search: op.read({
      input: z.object({
        term: z.string().min(1),
        take: z.coerce.number().int().optional(),
      }),
      output: z.object({ term: z.string(), take: z.number().optional() }),
      handler: ({ input }) => ({ term: input.term, take: input.take }),
    }),
    optionalBody: op.write({
      method: 'POST',
      path: 'optional-body',
      input: z.object({ note: z.string().optional() }),
      output: z.object({ ok: z.boolean() }),
      handler: () => ({ ok: true }),
    }),
    accepted: op.write({
      status: 202,
      output: z.object({ queued: z.boolean() }),
      handler: () => ({ queued: true }),
    }),
    noContent: op.delete({
      status: 204,
      output: false,
      handler: () => undefined,
    }),
    classField: op.read({
      output: z.object({ ok: z.boolean() }),
      handler: ClassFieldHandler,
    }),
  }),
});

const securedOps = operationResource({
  path: 'secure-ops',
  tags: ['SecureOps'],
  providers: [ShoutHandler],
  operations: (op) => ({
    shout: op.write({
      method: 'POST',
      status: 201,
      input: z.object({ text: z.string().min(1) }),
      output: z.object({ text: z.string() }),
      handler: ShoutHandler,
      decorators: [Mark()],
    }),
    version: op.read({
      public: true,
      output: z.object({ version: z.string() }),
      handler: () => ({ version: '1' }),
    }),
    tx: op.write({
      transactional: true,
      input: z.object({ n: z.number().int() }),
      output: z.object({ n: z.number() }),
      handler: ({ input }) => ({ n: input.n }),
    }),
    remove: op.delete({
      input: z.object({
        force: z.coerce.boolean().optional(),
      }),
      output: z.object({ removed: z.boolean() }),
      handler: ({ input }) => ({ removed: input.force === true }),
    }),
    replace: op.write({
      method: 'PUT',
      input: z.object({ name: z.string().min(1) }),
      output: z.object({ name: z.string() }),
      handler: ({ input }) => ({ name: input.name }),
    }),
  }),
});

/**
 * Resource-level params schema only names `:orgId`. The sync op adds
 * `:repoId` on its path — that extra Nest param must survive validation
 * (not be stripped by the whitelist).
 */
const paramsOps = operationResource({
  path: 'orgs/:orgId',
  params: z.object({ orgId: z.uuid() }),
  tags: ['Params'],
  public: true,
  operations: (op) => ({
    sync: op.write({
      path: 'repos/:repoId/sync',
      output: z.object({
        orgId: z.string(),
        repoId: z.string(),
      }),
      handler: ({ params }) => ({
        orgId: params.orgId,
        repoId: params.repoId,
      }),
    }),
  }),
});

const diAOps = operationResource({
  path: 'di-a',
  public: true,
  providers: [
    { provide: LOCAL_VALUE, useValue: 'a' },
    LocalValueHandler,
    RequestScopedHandler,
  ],
  operations: (op) => ({
    value: op.read({
      path: '',
      output: z.object({ value: z.string() }),
      handler: LocalValueHandler,
    }),
    scoped: op.read({
      output: z.object({ scoped: z.boolean() }),
      handler: RequestScopedHandler,
    }),
  }),
});

const diBOps = operationResource({
  path: 'di-b',
  public: true,
  providers: [{ provide: LOCAL_VALUE, useValue: 'b' }, LocalValueHandler],
  operations: (op) => ({
    value: op.read({
      path: '',
      output: z.object({ value: z.string() }),
      handler: LocalValueHandler,
    }),
  }),
});

const overrideOps = operationResource({
  path: 'override',
  public: true,
  providers: [
    {
      provide: ReplacedHandler,
      useValue: { handle: () => ({ source: 'replacement' }) },
    },
  ],
  operations: (op) => ({
    value: op.read({
      path: '',
      output: z.object({ source: z.string() }),
      handler: ReplacedHandler,
    }),
  }),
});

const aliasReadOps = operationResource({
  path: 'alias',
  public: true,
  operations: (op) => ({
    action: op.read({
      path: '',
      output: z.object({ readOnly: z.string() }),
      handler: () => ({ readOnly: 'read' }),
    }),
  }),
});

const aliasWriteOps = operationResource({
  path: 'alias',
  public: true,
  operations: (op) => ({
    action: op.write({
      path: '',
      output: z.object({ written: z.string() }),
      handler: () => ({ written: 'write' }),
    }),
  }),
});

const lowerLevelOps = defineOperationResource({
  path: 'lower',
  public: true,
  operations: {
    echo: {
      key: 'echo',
      method: 'POST',
      path: '',
      status: 200,
      inputDto: LowerInputDto,
      output: LowerOutputDto,
      handler: ({ input }) => input,
    },
    nested: {
      key: 'nested',
      method: 'POST',
      path: 'nested',
      status: 200,
      inputDto: LowerNestedInputDto,
      output: LowerOutputDto,
      handler: () => ({ name: 'ok' }),
    },
    optional: {
      key: 'optional',
      method: 'POST',
      path: 'optional',
      status: 200,
      inputDto: LowerOptionalInputDto,
      output: LowerOutputDto,
      handler: () => ({ name: 'ok' }),
    },
    primitive: {
      key: 'primitive',
      method: 'GET',
      path: 'primitive',
      status: 200,
      output: LowerOutputDto,
      handler: () => 'not-an-object',
    },
  },
});

interface OpenApiOperation {
  readonly operationId?: string;
  readonly parameters?: ReadonlyArray<{
    readonly name?: string;
    readonly in?: string;
    readonly required?: boolean;
  }>;
  readonly responses?: Record<
    string,
    {
      readonly content?: Record<
        string,
        { readonly schema?: { readonly $ref?: string } }
      >;
    }
  >;
  readonly security?: ReadonlyArray<Record<string, readonly string[]>>;
}

/** Owned by `InnerModule` and never exported — only its handler sees it. */
const INNER_SECRET = Symbol('INNER_SECRET');

@Injectable()
class ReExportedHandler {
  constructor(@Inject(INNER_SECRET) private readonly secret: string) {}

  handle() {
    return { value: this.secret };
  }
}

@Module({
  providers: [
    { provide: INNER_SECRET, useValue: 'inner-secret' },
    ReExportedHandler,
  ],
  exports: [ReExportedHandler],
})
class InnerModule {}

@Module({ imports: [InnerModule], exports: [InnerModule] })
class OuterModule {}

/**
 * The canonical dynamic-module host: `@Module({})` + `static forRoot()`.
 * `@Module({})` writes ZERO metadata (the decorator only defines keys
 * present in the object), so a re-exported host class is invisible to a
 * metadata-based module check — and every `@concepta/nestjs-*` module is
 * shaped this way.
 */
const DYNAMIC_SECRET = Symbol('DYNAMIC_SECRET');

@Injectable()
class DynamicHostHandler {
  constructor(@Inject(DYNAMIC_SECRET) private readonly secret: string) {}

  handle() {
    return { value: this.secret };
  }
}

@Module({})
class BillingModule {
  static forRoot(): DynamicModule {
    return {
      module: BillingModule,
      providers: [
        { provide: DYNAMIC_SECRET, useValue: 'billing-secret' },
        DynamicHostHandler,
      ],
      exports: [DynamicHostHandler],
    };
  }
}

@Module({ imports: [BillingModule.forRoot()], exports: [BillingModule] })
class PlatformModule {}

/**
 * The mirror-image shape: exports declared STATICALLY on the host class,
 * `forRoot()` returning no `exports` of its own, and the dynamic module
 * imported DIRECTLY rather than re-exported.
 *
 * Reading only the dynamic half concluded the handler was unsupplied,
 * registered a second copy locally, and that copy could not resolve
 * `STATIC_SECRET` — which is private to `StaticHostModule`.
 */
const STATIC_SECRET = Symbol('STATIC_SECRET');

@Injectable()
class StaticHostHandler {
  constructor(@Inject(STATIC_SECRET) private readonly secret: string) {}

  handle() {
    return { value: this.secret };
  }
}

@Module({
  providers: [
    { provide: STATIC_SECRET, useValue: 'static-secret' },
    StaticHostHandler,
  ],
  exports: [StaticHostHandler],
})
class StaticHostModule {
  static forRoot(): DynamicModule {
    return { module: StaticHostModule };
  }
}

/**
 * The case both previous fixes missed: a host that populates BOTH
 * halves — static `@Module` metadata AND dynamic `forRoot()` exports —
 * reached through a re-export.
 *
 * The re-export branch returned after reading the static half, so the
 * handler published only by `forRoot()` was auto-registered locally and
 * could not resolve `HYBRID_SECRET`. Nest's own scanner unions the two
 * (`reflectExports`); this pins that we do the same.
 */
const HYBRID_SECRET = Symbol('HYBRID_SECRET');

@Injectable()
class HybridStaticService {
  readonly label = 'static-half';
}

@Injectable()
class HybridHandler {
  constructor(@Inject(HYBRID_SECRET) private readonly secret: string) {}

  handle() {
    return { value: this.secret };
  }
}

@Module({
  providers: [HybridStaticService],
  exports: [HybridStaticService],
})
class HybridHostModule {
  static forRoot(): DynamicModule {
    return {
      module: HybridHostModule,
      providers: [
        { provide: HYBRID_SECRET, useValue: 'hybrid-secret' },
        HybridHandler,
      ],
      exports: [HybridHandler],
    };
  }
}

@Module({
  imports: [HybridHostModule.forRoot()],
  exports: [HybridHostModule],
})
class HybridWrapperModule {}

/**
 * Case B: a wrapper whose `forRoot()` returns `imports` AND re-exports
 * the metadata-less host it imported.
 *
 * The exports entry is the bare `NestedHostModule` CLASS; the module it
 * stands for lives in the WRAPPER's dynamic `imports`. Resolving that
 * needs the wrapper's own import list, which the export walk was not
 * given — so the handler was auto-registered locally and could not
 * resolve `NESTED_SECRET`.
 */
const NESTED_SECRET = Symbol('NESTED_SECRET');

@Injectable()
class NestedHandler {
  constructor(@Inject(NESTED_SECRET) private readonly secret: string) {}

  handle() {
    return { value: this.secret };
  }
}

@Module({})
class NestedHostModule {
  static forRoot(): DynamicModule {
    return {
      module: NestedHostModule,
      providers: [
        { provide: NESTED_SECRET, useValue: 'nested-secret' },
        NestedHandler,
      ],
      exports: [NestedHandler],
    };
  }
}

@Module({})
class NestedWrapperModule {
  static forRoot(): DynamicModule {
    return {
      module: NestedWrapperModule,
      imports: [NestedHostModule.forRoot()],
      exports: [NestedHostModule],
    };
  }
}

const nestedHostOps = operationResource({
  path: 'nested-host',
  public: true,
  imports: [NestedWrapperModule.forRoot()],
  operations: (op) => ({
    read: op.read({
      output: z.object({ value: z.string() }),
      handler: NestedHandler,
    }),
  }),
});

const hybridHostOps = operationResource({
  path: 'hybrid-host',
  public: true,
  imports: [HybridWrapperModule],
  operations: (op) => ({
    read: op.read({
      output: z.object({ value: z.string() }),
      handler: HybridHandler,
    }),
  }),
});

const staticHostOps = operationResource({
  path: 'static-host',
  public: true,
  imports: [StaticHostModule.forRoot()],
  operations: (op) => ({
    read: op.read({
      output: z.object({ value: z.string() }),
      handler: StaticHostHandler,
    }),
  }),
});

/**
 * A handler whose subtree injects REQUEST: without
 * `registerRequestByContextId`, the minted context id carried no
 * request payload and `this.request` was undefined — a 500 on every
 * call, though the identical class works as a plain controller dep.
 */
@Injectable({ scope: Scope.REQUEST })
class RequestReadingHandler {
  constructor(
    @Inject(REQUEST)
    private readonly request: { headers?: Record<string, unknown> },
  ) {}

  handle() {
    return { seen: String(this.request?.headers?.['x-probe'] ?? '') };
  }
}

const requestReadingOps = operationResource({
  path: 'request-reading',
  public: true,
  providers: [RequestReadingHandler],
  operations: (op) => ({
    read: op.read({
      output: z.object({ seen: z.string() }),
      handler: RequestReadingHandler,
    }),
  }),
});

const dynamicHostOps = operationResource({
  path: 'platform',
  public: true,
  imports: [PlatformModule],
  operations: (op) => ({
    value: op.read({
      output: z.object({ value: z.string() }),
      handler: DynamicHostHandler,
    }),
  }),
});

const reExportedOps = operationResource({
  path: 're-exported',
  public: true,
  imports: [OuterModule],
  operations: (op) => ({
    value: op.read({
      output: z.object({ value: z.string() }),
      handler: ReExportedHandler,
    }),
  }),
});

describe('operationResource e2e (issue #43 v1)', () => {
  let app: INestApplication;
  let openApiPaths: Record<string, Record<string, OpenApiOperation>>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SimpleAuthProvider),
          providers: [SimpleAuthProvider],
          resources: [
            publicOps,
            securedOps,
            paramsOps,
            diAOps,
            diBOps,
            overrideOps,
            aliasReadOps,
            aliasWriteOps,
            lowerLevelOps,
          ],
          global: true,
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    const swagger = new DocumentBuilder().setTitle('ops').build();
    const document = SwaggerModule.createDocument(app, swagger);
    openApiPaths = document.paths as typeof openApiPaths;
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves a public query without auth and strips undeclared output fields', async () => {
    const res = await request(app.getHttpServer()).get('/ops').expect(200);
    expect(res.body).toEqual({ ok: true });
    expect(res.body).not.toHaveProperty('internal');
  });

  it('returns array outputs and strips undeclared item fields', async () => {
    const res = await request(app.getHttpServer())
      .get('/ops/items')
      .expect(200);
    expect(res.body).toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('returns 500 when the handler violates outputDto', async () => {
    await request(app.getHttpServer()).get('/ops/broken').expect(500);
  });

  it('returns 500 when the handler returns undefined under an output schema', async () => {
    await request(app.getHttpServer()).get('/ops/voidish').expect(500);
  });

  it('validates GET query input (with z.coerce)', async () => {
    await request(app.getHttpServer())
      .get('/ops/search')
      .query({ term: 'hi', take: '2' })
      .expect(200)
      .expect({ term: 'hi', take: 2 });
  });

  it('uses custom statuses at runtime', async () => {
    await request(app.getHttpServer())
      .post('/ops/accepted')
      .expect(202)
      .expect({ queued: true });
    await request(app.getHttpServer()).delete('/ops/noContent').expect(204);
  });

  it('supports ES classes with instance-field handle methods', async () => {
    await request(app.getHttpServer())
      .get('/ops/classField')
      .expect(200)
      .expect({ ok: true });
  });

  it('rejects unauthenticated command', async () => {
    await request(app.getHttpServer())
      .post('/secure-ops/shout')
      .send({ text: 'hi' })
      .expect(401);
  });

  it('allows a public op on a secured resource without auth', async () => {
    await request(app.getHttpServer())
      .get('/secure-ops/version')
      .expect(200)
      .expect({ version: '1' });
  });

  it('validates command body, returns 201, and strips undeclared output fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/secure-ops/shout')
      .set('Authorization', 'Bearer ok')
      .send({ text: 'hello', extra: 'drop-me' })
      .expect(201);
    expect(res.body).toEqual({ text: 'HELLO' });
    expect(res.body).not.toHaveProperty('secret');
  });

  it('rejects invalid command body', async () => {
    await request(app.getHttpServer())
      .post('/secure-ops/shout')
      .set('Authorization', 'Bearer ok')
      .send({ text: '' })
      .expect(400);
  });

  it('runs a transactional command when authorized', async () => {
    await request(app.getHttpServer())
      .post('/secure-ops/tx')
      .set('Authorization', 'Bearer ok')
      .send({ n: 3 })
      .expect(200)
      .expect({ n: 3 });
  });

  it('sources DELETE input from query string', async () => {
    await request(app.getHttpServer())
      .delete('/secure-ops/remove')
      .set('Authorization', 'Bearer ok')
      .query({ force: 'true' })
      .expect(200)
      .expect({ removed: true });
  });

  it('accepts PUT write methods', async () => {
    await request(app.getHttpServer())
      .put('/secure-ops/replace')
      .set('Authorization', 'Bearer ok')
      .send({ name: 'widget' })
      .expect(200)
      .expect({ name: 'widget' });
  });

  it('validates resource params and preserves op-path params not in the schema', async () => {
    const orgId = '11111111-1111-4111-8111-111111111111';
    const repoId = '22222222-2222-4222-8222-222222222222';
    await request(app.getHttpServer())
      .post(`/orgs/${orgId}/repos/${repoId}/sync`)
      .expect(200)
      .expect({ orgId, repoId });
  });

  it('rejects invalid resource params with 400', async () => {
    await request(app.getHttpServer())
      .post('/orgs/not-a-uuid/repos/repo-1/sync')
      .expect(400);
  });

  it('keeps operation handlers isolated to their owning resource module', async () => {
    await request(app.getHttpServer())
      .get('/di-a')
      .expect(200)
      .expect({ value: 'a' });
    await request(app.getHttpServer())
      .get('/di-b')
      .expect(200)
      .expect({ value: 'b' });
  });

  it('resolves request-scoped operation handlers', async () => {
    await request(app.getHttpServer())
      .get('/di-a/scoped')
      .expect(200)
      .expect({ scoped: true });
  });

  it('does not override explicit handler providers', async () => {
    await request(app.getHttpServer())
      .get('/override')
      .expect(200)
      .expect({ source: 'replacement' });
  });

  it('validates lower-level class-validator input strictly', async () => {
    await request(app.getHttpServer()).post('/lower').send({}).expect(400);
    await request(app.getHttpServer())
      .post('/lower')
      .send({ name: 'ok', extra: 'drop-me' })
      .expect(200)
      .expect({ name: 'ok' });
  });

  // Coercing a non-record body to `{}` let an array pass an all-optional
  // DTO on both authoring paths: zod itself rejects the array, and the
  // class path never saw one. Substituting a valid value for an invalid
  // one on a validation boundary is the shape being removed here.
  it('rejects a non-object body on the zod path', async () => {
    // Asserted on OUR message, not just the status. A scalar body is
    // rejected by body-parser before reaching this code, so a bare
    // `.expect(400)` would pass with the fix reverted and prove nothing.
    const rejected = await request(app.getHttpServer())
      .post('/ops/optional-body')
      .send([])
      .expect(400);
    expect(rejected.body.message).toMatch(/Expected a JSON object body/);
    // The legitimate shapes still pass.
    await request(app.getHttpServer())
      .post('/ops/optional-body')
      .send({})
      .expect(200);
    await request(app.getHttpServer())
      .post('/ops/optional-body')
      .send({ note: 'hi' })
      .expect(200);
  });

  it('rejects a non-object body on the lower-level class path', async () => {
    const rejected = await request(app.getHttpServer())
      .post('/lower/optional')
      .send([])
      .expect(400);
    expect(rejected.body.message).toMatch(/Expected a JSON object body/);
    await request(app.getHttpServer())
      .post('/lower/optional')
      .send({})
      .expect(200);
  });

  // A @ValidateNested failure carries its constraints in children, not
  // on the root error. Flattening only the top level answered 400 with
  // `message: []` — a rejection that names nothing.
  it('names the nested field in a class-validator 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/lower/nested')
      .send({ name: 'ok', child: {} })
      .expect(400);
    expect(JSON.stringify(res.body.message)).toMatch(/child\.street/);
  });

  it('rejects lower-level class-validator primitive output', async () => {
    await request(app.getHttpServer()).get('/lower/primitive').expect(500);
  });

  it('emits deterministic Swagger operationIds and GET query parameters', () => {
    expect(openApiPaths['/ops']?.get?.operationId).toBe(
      'OperationResource_ops_get_ping',
    );
    expect(openApiPaths['/secure-ops/shout']?.post?.operationId).toBe(
      'OperationResource_secure_ops_post_shout',
    );
    const searchParams = openApiPaths['/ops/search']?.get?.parameters ?? [];
    const queryParams = searchParams.filter((p) => p.in === 'query');
    expect(queryParams.map((p) => p.name).sort()).toEqual(['take', 'term']);
    expect(queryParams.find((p) => p.name === 'term')?.required).toBe(true);
    expect(queryParams.find((p) => p.name === 'take')?.required).toBe(false);
  });

  it('emits status-aware Swagger responses and public method security overrides', () => {
    expect(openApiPaths['/ops/accepted']?.post?.responses).toHaveProperty(
      '202',
    );
    expect(openApiPaths['/ops/noContent']?.delete?.responses).toHaveProperty(
      '204',
    );
    expect(openApiPaths['/secure-ops/version']?.get?.security).toEqual([{}]);
  });

  it('uses method-discriminated Swagger operationIds and DTO component refs', () => {
    const read = openApiPaths['/alias']?.get;
    const write = openApiPaths['/alias']?.post;
    expect(read?.operationId).toBe('OperationResource_alias_get_action');
    expect(write?.operationId).toBe('OperationResource_alias_post_action');
    const readRef =
      read?.responses?.['200']?.content?.['application/json']?.schema?.$ref;
    const writeRef =
      write?.responses?.['200']?.content?.['application/json']?.schema?.$ref;
    expect(readRef).toContain('Alias_Get_ActionOutput');
    expect(writeRef).toContain('Alias_Post_ActionOutput');
  });

  it('applies custom method decorators', () => {
    expect(
      Reflect.getMetadata(OPS_MARK, securedOps.controller.prototype.shout),
    ).toBe(true);
  });
});

/**
 * Bootstrap regression for the transitive module re-export finding.
 *
 * `OuterModule` imports and re-exports `InnerModule`, which owns both the
 * handler and a dependency PRIVATE to itself. Reading only direct export
 * entries made the handler look unsupplied, so it was auto-registered in
 * the generated operation module — where its private dependency does not
 * exist. The app then failed to boot with "Nest can't resolve
 * dependencies".
 *
 * Asserted by booting, not by inspecting providers: the whole point is
 * that the container can build the graph.
 */
describe('operationResource — handler behind a re-exported module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SimpleAuthProvider),
          providers: [SimpleAuthProvider],
          resources: [reExportedOps],
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

  it('resolves the handler from the owning module, private deps and all', async () => {
    const res = await request(app.getHttpServer())
      .get('/re-exported/value')
      .expect(200);

    expect(res.body).toEqual({ value: 'inner-secret' });
  });
});

/**
 * Same shape as the re-exported-module case above, but the inner module
 * is a DYNAMIC module host. Its dependency is private to that module, so
 * auto-registering the handler locally makes the app fail to boot.
 */
describe('operationResource — handler behind a re-exported dynamic module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SimpleAuthProvider),
          providers: [SimpleAuthProvider],
          resources: [dynamicHostOps],
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

  it('boots and resolves the handler from the dynamic module', async () => {
    const res = await request(app.getHttpServer())
      .get('/platform/value')
      .expect(200);

    expect(res.body).toEqual({ value: 'billing-secret' });
  });
});

/**
 * The direct-import twin of the block above: `forRoot()` returns no
 * `exports`, so everything the module publishes lives in the STATIC
 * `@Module` metadata on its host class. Reading only the dynamic half
 * auto-registered a second handler copy that could not resolve
 * `STATIC_SECRET`, and the app failed to boot.
 */
describe('operationResource — handler behind a directly imported forRoot() (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SimpleAuthProvider),
          providers: [SimpleAuthProvider],
          resources: [staticHostOps],
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

  it('boots and resolves the handler the host class exports statically', async () => {
    const res = await request(app.getHttpServer())
      .get('/static-host/read')
      .expect(200);

    expect(res.body).toEqual({ value: 'static-secret' });
  });
});

/**
 * Host with static AND dynamic exports, reached through a re-export.
 * Fixing only the direct-import path left this half broken.
 */
describe('operationResource — handler behind a hybrid re-exported host (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SimpleAuthProvider),
          providers: [SimpleAuthProvider],
          resources: [hybridHostOps],
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

  it('resolves a handler published only by the dynamic half', async () => {
    const res = await request(app.getHttpServer())
      .get('/hybrid-host/read')
      .expect(200);

    expect(res.body).toEqual({ value: 'hybrid-secret' });
  });
});

/**
 * Dynamic wrapper re-exporting a dynamically imported host. The export
 * walk needs the WRAPPER's own imports to resolve the bare class entry.
 */
describe('operationResource — handler behind a dynamic wrapper re-export (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SimpleAuthProvider),
          providers: [SimpleAuthProvider],
          resources: [nestedHostOps],
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

  it('resolves through a dynamic wrapper that re-exports its dynamic import', async () => {
    const res = await request(app.getHttpServer())
      .get('/nested-host/read')
      .expect(200);

    expect(res.body).toEqual({ value: 'nested-secret' });
  });
});
describe('operationResource — handler injecting REQUEST (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SimpleAuthProvider),
          providers: [SimpleAuthProvider],
          resources: [requestReadingOps],
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

  it('resolves REQUEST inside the handler subtree', async () => {
    const res = await request(app.getHttpServer())
      .get('/request-reading/read')
      .set('x-probe', 'probe-7')
      .expect(200);
    expect(res.body).toEqual({ seen: 'probe-7' });
  });
});
