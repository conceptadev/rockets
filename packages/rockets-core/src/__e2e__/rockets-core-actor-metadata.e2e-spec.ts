/**
 * Token claims reaching a tenant resolver through `actor.metadata` (#119).
 *
 * The auth adapter already puts the token's claims on the authenticated
 * user, but the actor overlay used to copy only the user id, so a
 * `TenantScopeHook` resolving tenants from `Actor.metadata` never saw
 * them and every scoped list came back empty. `actor.metadata` on the
 * module maps the user into the actor once per request.
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
import type { Actor } from '../domain/interfaces/actor.interface';
import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import type { RocketsActorOptions } from '../infrastructure/config/interfaces/rockets-actor-options.interface';
import { extractBearerToken } from '../infrastructure/auth/extract-bearer-token';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { TenantScopeHook } from '../infrastructure/hooks/tenant-scope.hook';
import { defineResource } from '../infrastructure/resource/define-resource';
import { defineSubResource } from '../infrastructure/resource/define-sub-resource';
import { RocketsCoreModule } from '../rockets-core.module';

/** u1 and u2 carry their dealers as a claim; u3 has no claims at all. */
@Injectable()
class ClaimsAuthAdapter implements AuthAdapterInterface {
  async authenticate(req: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(req);
    if (token === null) return { matched: false };
    if (token === 'u1') {
      return {
        matched: true,
        user: { id: 'u1', sub: 'u1', claims: { dealers: ['d1'] } },
      };
    }
    if (token === 'u2') {
      return {
        matched: true,
        user: { id: 'u2', sub: 'u2', claims: { dealers: ['d2'] } },
      };
    }
    if (token === 'u3') {
      return { matched: true, user: { id: 'u3', sub: 'u3' } };
    }
    return { matched: true, error: new UnauthorizedException() };
  }
}

@Entity('actor_metadata_cars')
class CarEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  @Column({ type: 'varchar' }) dealerId!: string;
}

const carCreateSchema = withOpenApi(
  z.object({ name: z.string(), dealerId: z.string() }),
  'CarCreateDto',
);
const carResponseSchema = withOpenApi(
  z.object({ id: z.uuid(), name: z.string(), dealerId: z.string() }),
  'CarResponseDto',
);

function stringList(value: unknown): readonly string[] {
  return Array.isArray(value) &&
    value.every((item): item is string => typeof item === 'string')
    ? value
    : [];
}

const DealerScope = TenantScopeHook.for<CarEntity>(CarEntity, {
  tenantKey: 'dealerId',
  resolve: (actor: Actor) => stringList(actor.metadata?.dealerIds),
});

const carResource = defineResource<CarEntity>({
  key: 'car',
  entity: CarEntity,
  path: 'cars',
  hooks: [DealerScope],
  operations: {
    list: { output: carResponseSchema },
    create: { input: carCreateSchema, output: carResponseSchema },
  },
});

/**
 * Sub-resource case: the parent is tenant-scoped from `Actor.metadata`, and
 * `/dealers/:dealerId/cars` looks the parent up in a guard that runs before
 * the actor overlay. That guard has to build the actor the same way, or
 * the parent lookup never sees the claim.
 */
@Entity('actor_metadata_dealers')
class DealerEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  @Column({ type: 'varchar' }) tenantId!: string;
  // Typed only: `subResources` keys must name a property of the parent.
  cars?: DealerCarEntity[];
}

@Entity('actor_metadata_dealer_cars')
class DealerCarEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar' }) name!: string;
  @Column({ type: 'varchar' }) dealerId!: string;
}

const dealerCreateSchema = withOpenApi(
  z.object({ name: z.string(), tenantId: z.string() }),
  'DealerCreateDto',
);
const dealerResponseSchema = withOpenApi(
  z.object({ id: z.uuid(), name: z.string(), tenantId: z.string() }),
  'DealerResponseDto',
);
const dealerCarCreateSchema = withOpenApi(
  z.object({ name: z.string() }),
  'DealerCarCreateDto',
);
const dealerCarResponseSchema = withOpenApi(
  z.object({ id: z.uuid(), name: z.string(), dealerId: z.string() }),
  'DealerCarResponseDto',
);

const TenantDealerScope = TenantScopeHook.for<DealerEntity>(DealerEntity, {
  tenantKey: 'tenantId',
  resolve: (actor: Actor) => stringList(actor.metadata?.dealerIds),
});

const dealerResource = defineResource<DealerEntity>({
  key: 'dealer',
  entity: DealerEntity,
  path: 'dealers',
  hooks: [TenantDealerScope],
  operations: {
    read: { output: dealerResponseSchema },
    create: { input: dealerCreateSchema, output: dealerResponseSchema },
  },
  subResources: {
    cars: defineSubResource<DealerCarEntity>({
      key: 'dealerCar',
      entity: DealerCarEntity,
      parentKey: 'dealerId',
      owner: false,
      operations: {
        list: { output: dealerCarResponseSchema },
        create: {
          input: dealerCarCreateSchema,
          output: dealerCarResponseSchema,
        },
      },
    }),
  },
});

const dealerMetadata: RocketsActorOptions = {
  metadata: (user) =>
    user.claims ? { dealerIds: user.claims.dealers } : undefined,
};

async function bootApp(actor?: RocketsActorOptions): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [CarEntity],
        synchronize: true,
        dropSchema: true,
      }),
      RocketsCoreModule.forRoot({
        auth: defineAuthAdapter(ClaimsAuthAdapter),
        providers: [ClaimsAuthAdapter],
        repository: TypeOrmRepositoryModule,
        resources: [carResource],
        ...(actor ? { actor } : {}),
        global: true,
      }),
    ],
    providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
  }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

async function seed(app: INestApplication): Promise<void> {
  for (const [token, dealerId] of [
    ['u1', 'd1'],
    ['u2', 'd2'],
  ] as const) {
    await request(app.getHttpServer())
      .post('/cars')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `car-${dealerId}`, dealerId })
      .expect(201);
  }
}

function dealersIn(body: { data: { dealerId: string }[] }): string[] {
  return body.data.map((row) => row.dealerId);
}

describe('actor.metadata carries token claims to the tenant resolver (e2e, #119)', () => {
  describe('with actor.metadata', () => {
    let app: INestApplication;

    beforeAll(async () => {
      app = await bootApp(dealerMetadata);
      await seed(app);
    }, 30000);

    afterAll(async () => {
      if (app) await app.close();
    });

    it('scopes each user to the dealers in their token', async () => {
      const u1 = await request(app.getHttpServer())
        .get('/cars')
        .set('Authorization', 'Bearer u1')
        .expect(200);
      expect(dealersIn(u1.body)).toEqual(['d1']);

      const u2 = await request(app.getHttpServer())
        .get('/cars')
        .set('Authorization', 'Bearer u2')
        .expect(200);
      expect(dealersIn(u2.body)).toEqual(['d2']);
    });

    it('still fails closed for a user whose token has no claims', async () => {
      const u3 = await request(app.getHttpServer())
        .get('/cars')
        .set('Authorization', 'Bearer u3')
        .expect(200);
      expect(u3.body.data).toEqual([]);
    });
  });

  describe('without actor.metadata', () => {
    let app: INestApplication;

    beforeAll(async () => {
      app = await bootApp();
      await seed(app);
    }, 30000);

    afterAll(async () => {
      if (app) await app.close();
    });

    // The gap the option closes: the claim is on the user, but nothing
    // copies it to the actor, so the resolver sees no dealers.
    it('never shows the resolver the claim', async () => {
      const u1 = await request(app.getHttpServer())
        .get('/cars')
        .set('Authorization', 'Bearer u1')
        .expect(200);
      expect(u1.body.data).toEqual([]);
    });
  });

  describe('on a sub-resource', () => {
    let app: INestApplication;
    let ownDealer: string;
    let otherDealer: string;

    beforeAll(async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [DealerEntity, DealerCarEntity],
            synchronize: true,
            dropSchema: true,
          }),
          RocketsCoreModule.forRoot({
            auth: defineAuthAdapter(ClaimsAuthAdapter),
            providers: [ClaimsAuthAdapter],
            repository: TypeOrmRepositoryModule,
            resources: [dealerResource],
            actor: dealerMetadata,
            global: true,
          }),
        ],
        providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
      }).compile();
      app = moduleRef.createNestApplication();
      await app.init();

      const own = await request(app.getHttpServer())
        .post('/dealers')
        .set('Authorization', 'Bearer u1')
        .send({ name: 'own', tenantId: 'd1' })
        .expect(201);
      ownDealer = own.body.id;
      const other = await request(app.getHttpServer())
        .post('/dealers')
        .set('Authorization', 'Bearer u2')
        .send({ name: 'other', tenantId: 'd2' })
        .expect(201);
      otherDealer = other.body.id;
    }, 30000);

    afterAll(async () => {
      if (app) await app.close();
    });

    it('lets the parent lookup see the claim, so nested routes work', async () => {
      await request(app.getHttpServer())
        .get(`/dealers/${ownDealer}`)
        .set('Authorization', 'Bearer u1')
        .expect(200);

      await request(app.getHttpServer())
        .post(`/dealers/${ownDealer}/cars`)
        .set('Authorization', 'Bearer u1')
        .send({ name: 'nested' })
        .expect(201);

      const cars = await request(app.getHttpServer())
        .get(`/dealers/${ownDealer}/cars`)
        .set('Authorization', 'Bearer u1')
        .expect(200);
      expect(cars.body.data).toHaveLength(1);
    });

    it("still keeps another tenant's parent out of reach", async () => {
      await request(app.getHttpServer())
        .get(`/dealers/${otherDealer}/cars`)
        .set('Authorization', 'Bearer u1')
        .expect(404);
    });
  });
});
