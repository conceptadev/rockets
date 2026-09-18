/**
 * `PUT` is a write like any other: the owner/tenant column in its body must
 * not reach the row unchecked.
 *
 * It did. `OwnerStampHook` and `TenantStampHook` covered `beforeCreate` and
 * `beforeUpdate`, and the hook base exposed no `beforeReplace` channel at
 * all — upstream has one, Rockets simply did not surface it. So a resource
 * that opted into `replace` and listed the column in its replace schema let
 * a caller hand their row to someone else, with a 200 and no trace.
 *
 * `replace` is not a default operation, and the zod layer never puts an
 * owner column in an input projection, so the exposure needed a
 * hand-written resource. That is narrow, not harmless.
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
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import { withOpenApi } from '@concepta/nestjs-core';
import request from 'supertest';
import { z } from 'zod';

import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import type { Actor } from '../domain/interfaces/actor.interface';
import { extractBearerToken } from '../infrastructure/auth/extract-bearer-token';
import { RocketsCoreModule } from '../rockets-core.module';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { defineResource } from '../infrastructure/resource/define-resource';
import { OwnerScopeHook } from '../infrastructure/hooks/owner-scope.hook';
import { OwnerStampHook } from '../infrastructure/hooks/owner-stamp.hook';
import { TenantScopeHook } from '../infrastructure/hooks/tenant-scope.hook';
import { TenantStampHook } from '../infrastructure/hooks/tenant-stamp.hook';

@Entity('replace_pets')
class PetEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  @Column({ type: 'varchar' }) userId!: string;
}

@Entity('replace_docs')
class DocEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) title!: string;
  @Column({ type: 'varchar' }) tenantId!: string;
}

// The vulnerable shape, written out on purpose: the column IS in the body.
const petReplaceSchema = withOpenApi(
  z.object({ name: z.string(), userId: z.string().optional() }),
  'ReplacePetReplaceDto',
);
const petResponseSchema = withOpenApi(
  z.object({ id: z.uuid(), name: z.string(), userId: z.string() }),
  'ReplacePetResponseDto',
);
const docReplaceSchema = withOpenApi(
  z.object({ title: z.string(), tenantId: z.string().optional() }),
  'ReplaceDocReplaceDto',
);
const docResponseSchema = withOpenApi(
  z.object({ id: z.uuid(), title: z.string(), tenantId: z.string() }),
  'ReplaceDocResponseDto',
);

const TENANTS: Readonly<Record<string, readonly string[]>> = {
  u1: ['tenant-a'],
  u2: ['tenant-b'],
};

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

function tenantsFor(actor: Actor): readonly string[] {
  return TENANTS[actor.id] ?? [];
}

describe('replace must not reassign an owner or a tenant (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [PetEntity, DocEntity],
          synchronize: true,
          dropSchema: true,
        }),
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(TwoUserAdapter),
          providers: [TwoUserAdapter],
          repository: TypeOrmRepositoryModule,
          actor: { metadata: (user) => ({ actorId: user.id }) },
          resources: [
            defineResource<PetEntity>({
              entity: PetEntity,
              path: 'replace-pets',
              hooks: [
                OwnerStampHook.for(PetEntity),
                OwnerScopeHook.for(PetEntity),
              ],
              operations: {
                read: { output: petResponseSchema },
                create: {
                  input: withOpenApi(
                    z.object({ name: z.string() }),
                    'ReplacePetCreateDto',
                  ),
                  output: petResponseSchema,
                },
                replace: { input: petReplaceSchema, output: petResponseSchema },
              },
            }),
            defineResource<DocEntity>({
              entity: DocEntity,
              path: 'replace-docs',
              hooks: [
                TenantStampHook.for<DocEntity>(DocEntity, {
                  tenantKey: 'tenantId',
                  resolve: tenantsFor,
                }),
                TenantScopeHook.for<DocEntity>(DocEntity, {
                  tenantKey: 'tenantId',
                  resolve: tenantsFor,
                }),
              ],
              operations: {
                read: { output: docResponseSchema },
                create: {
                  input: withOpenApi(
                    z.object({ title: z.string() }),
                    'ReplaceDocCreateDto',
                  ),
                  output: docResponseSchema,
                },
                replace: { input: docReplaceSchema, output: docResponseSchema },
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

  it('keeps the owner when a replace body carries another user id', async () => {
    const created = await request(app.getHttpServer())
      .post('/replace-pets')
      .set('Authorization', 'Bearer u1')
      .send({ name: 'rex' })
      .expect(201);
    expect(created.body.userId).toBe('u1');

    const replaced = await request(app.getHttpServer())
      .put(`/replace-pets/${created.body.id}`)
      .set('Authorization', 'Bearer u1')
      .send({ name: 'rex', userId: 'u2' });

    // The stamp overwrites the client's value rather than refusing the
    // request — same semantics as `beforeUpdate`.
    expect(replaced.status).toBeLessThan(400);
    expect(replaced.body.userId).toBe('u1');

    // And the row on disk agrees: u2 cannot read it.
    await request(app.getHttpServer())
      .get(`/replace-pets/${created.body.id}`)
      .set('Authorization', 'Bearer u2')
      .expect(404);
  });

  it('keeps the tenant when a replace body carries another tenant', async () => {
    const created = await request(app.getHttpServer())
      .post('/replace-docs')
      .set('Authorization', 'Bearer u1')
      .send({ title: 'spec' })
      .expect(201);
    expect(created.body.tenantId).toBe('tenant-a');

    const replaced = await request(app.getHttpServer())
      .put(`/replace-docs/${created.body.id}`)
      .set('Authorization', 'Bearer u1')
      .send({ title: 'spec', tenantId: 'tenant-b' });

    // Out-of-range tenant: the hook refuses rather than silently rewriting.
    const stillMine = await request(app.getHttpServer())
      .get(`/replace-docs/${created.body.id}`)
      .set('Authorization', 'Bearer u1')
      .expect(200);
    expect(stillMine.body.tenantId).toBe('tenant-a');
    expect(replaced.body?.tenantId ?? 'tenant-a').toBe('tenant-a');

    await request(app.getHttpServer())
      .get(`/replace-docs/${created.body.id}`)
      .set('Authorization', 'Bearer u2')
      .expect(404);
  });

  it('still refuses a replace aimed at another user row', async () => {
    const theirs = await request(app.getHttpServer())
      .post('/replace-pets')
      .set('Authorization', 'Bearer u2')
      .send({ name: 'theirs' })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/replace-pets/${theirs.body.id}`)
      .set('Authorization', 'Bearer u1')
      .send({ name: 'hijack' })
      .expect(404);
  });
});
