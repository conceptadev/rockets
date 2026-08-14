import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  INestApplication,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
import {
  command,
  operationResource,
  query,
} from '../zod/zod-operation-resource';
import type { OperationContext } from '../domain/interfaces/operation-resource.interface';

const OPS_MARK = 'ops:mark';
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

const publicOps = operationResource({
  path: 'ops',
  tags: ['Ops'],
  public: true,
  operations: {
    ping: query({
      summary: 'Health ping',
      output: z.object({ ok: z.boolean() }),
      handler: () => ({ ok: true, internal: true }),
    }),
    items: query({
      path: 'items',
      output: z.array(z.object({ id: z.string() })),
      handler: () => [{ id: 'a' }, { id: 'b', extra: true } as { id: string }],
    }),
    broken: query({
      path: 'broken',
      output: z.object({ ok: z.literal(true) }),
      handler: () => ({ ok: false as unknown as true }),
    }),
    voidish: query({
      path: 'voidish',
      output: z.object({ ok: z.boolean() }),
      handler: () => undefined as unknown as { ok: boolean },
    }),
    search: query({
      path: 'search',
      input: z.object({
        term: z.string().min(1),
        take: z.coerce.number().int().optional(),
      }),
      output: z.object({ term: z.string(), take: z.number().optional() }),
      handler: ({ input }) => ({ term: input.term, take: input.take }),
    }),
  },
});

const securedOps = operationResource({
  path: 'secure-ops',
  tags: ['SecureOps'],
  providers: [ShoutHandler],
  operations: {
    shout: command({
      method: 'POST',
      path: 'shout',
      status: 201,
      input: z.object({ text: z.string().min(1) }),
      output: z.object({ text: z.string() }),
      handler: ShoutHandler,
      decorators: [Mark()],
    }),
    version: query({
      path: 'version',
      public: true,
      output: z.object({ version: z.string() }),
      handler: () => ({ version: '1' }),
    }),
    tx: command({
      path: 'tx',
      transactional: true,
      input: z.object({ n: z.number().int() }),
      output: z.object({ n: z.number() }),
      handler: ({ input }) => ({ n: input.n }),
    }),
  },
});

describe('operationResource e2e (issue #43 v1)', () => {
  let app: INestApplication;
  let openApiPaths: Record<
    string,
    Record<
      string,
      {
        operationId?: string;
        parameters?: Array<{ name?: string; in?: string; required?: boolean }>;
      }
    >
  >;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SimpleAuthProvider),
          providers: [SimpleAuthProvider],
          resources: [publicOps, securedOps],
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

  it('emits deterministic Swagger operationIds and GET query parameters', () => {
    expect(openApiPaths['/ops']?.get?.operationId).toBe(
      'OperationResource_ops_ping',
    );
    expect(openApiPaths['/secure-ops/shout']?.post?.operationId).toBe(
      'OperationResource_secure_ops_shout',
    );
    const searchParams = openApiPaths['/ops/search']?.get?.parameters ?? [];
    const queryParams = searchParams.filter((p) => p.in === 'query');
    expect(queryParams.map((p) => p.name).sort()).toEqual(['take', 'term']);
    expect(queryParams.find((p) => p.name === 'term')?.required).toBe(true);
    expect(queryParams.find((p) => p.name === 'take')?.required).toBe(false);
  });

  it('applies custom method decorators', () => {
    expect(
      Reflect.getMetadata(OPS_MARK, securedOps.controller.prototype.shout),
    ).toBe(true);
  });
});
