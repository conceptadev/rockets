# Guide: database row-level security

Hooks scope the rows your API asks for. Row-level security (RLS) scopes the
rows the **database** is willing to return — so a hand-written query, a
migration script, or a forgotten `repository.find()` cannot leak across
tenants.

This guide wires the seam Rockets gives you for it: one transaction per
operation, and a session variable set on that transaction's client before
any row is read.

Every file is compiled and booted by `yarn docs:check`. The compiled app
runs on SQLite, which has no RLS — the statement is dialect-guarded, and
the Postgres side is spelled out below it.

## 1. Install

```bash
yarn add @concepta/rockets-core@alpha \
  @concepta/rockets-repository-typeorm@alpha typeorm @nestjs/typeorm sqlite3 \
  @nestjs/common @nestjs/core jsonwebtoken reflect-metadata rxjs zod
```

```bash
JWT_SECRET=dev-secret yarn start
```

## 2. The policy in the database

Run this once, as a migration. Rockets does not generate it: the policy is
the database's, and it is the half that survives a bug in application code.

```sql
ALTER TABLE pet ENABLE ROW LEVEL SECURITY;

CREATE POLICY pet_tenant_isolation ON pet
  USING (tenant_id = current_setting('app.tenant_id', true));

-- The API's role must not bypass it. A superuser or a role with BYPASSRLS
-- ignores every policy above.
ALTER TABLE pet FORCE ROW LEVEL SECURITY;
```

`current_setting('app.tenant_id', true)` returns NULL when the variable is
unset, and `NULL = anything` is never true — so a connection that forgot to
set it sees **no rows** instead of all of them. That is the property to
preserve in every step below.

## 3. The entity and its schemas

```typescript
// src/pet.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pet')
export class PetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 64, name: 'tenant_id' })
  tenantId!: string;
}
```

```typescript
// src/pet.schemas.ts
import { z } from 'zod';
import { withOpenApi } from '@concepta/rockets-core';

export const petCreateSchema = withOpenApi(
  z.object({ name: z.string().max(100) }),
  'PetCreateDto',
);

export const petResponseSchema = withOpenApi(
  z.object({ id: z.uuid(), name: z.string(), tenantId: z.string() }),
  'PetResponseDto',
);
```

## 4. The adapter carries the tenant

```typescript
// src/auth/jwt.adapter.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
  defineAuthAdapter,
  extractBearerToken,
} from '@concepta/rockets-core';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`${name} is not set — the JWT adapter cannot verify tokens.`);
  }
  return value;
}

const jwtSecret = requireEnv('JWT_SECRET');

@Injectable()
export class JwtAdapter implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(request);
    if (token === null) return { matched: false };
    try {
      const payload = verify(token, jwtSecret) as {
        sub: string;
        tenant?: string;
      };
      return {
        matched: true,
        user: {
          id: payload.sub,
          sub: payload.sub,
          // Replace the fallback with your provider's tenant claim.
          claims: { tenant: payload.tenant ?? 'tenant-demo' },
        },
      };
    } catch {
      return { matched: true, error: new UnauthorizedException() };
    }
  }
}

export const jwtAuth = defineAuthAdapter(JwtAdapter);
```

## 5. Set the variable on the transaction's client

This is the seam. Two facts decide its shape:

- **No hook runs when a transaction opens.** The adapter starts the real
  transaction lazily, on the first repository call that forwards `ctx`, so
  the variable has to be set by the first thing that touches the database
  inside the operation — a `before*` hook.
- **`SET LOCAL` / `set_config(..., true)` live and die with the
  transaction.** Without `transactional: true` on the operation there is no
  transaction to scope them to, and a pooled connection would carry the
  value to the next request.

```typescript
// src/tenant-session.hook.ts
import {
  AppContextHost,
  TrxCtx,
  defineHook,
  getActor,
  type EntityHookContext,
} from '@concepta/rockets-core';
import type { EntityManager } from 'typeorm';
import { PetEntity } from './pet.entity';

/** Dialects whose session variables this hook knows how to set. */
const usesPostgres = (process.env.DB_DIALECT ?? 'sqlite') === 'postgres';

async function applyTenantSession(ctx?: EntityHookContext): Promise<void> {
  // `getActor(ctx)`, never `ctx.actor`: the actor is an overlay on the
  // context, so the plain field is always undefined.
  const tenantId = getActor(ctx)?.metadata?.tenantId;
  if (typeof tenantId !== 'string') {
    // Fail closed: no tenant, no session variable, and the policy above
    // returns nothing. Never fall back to "all rows".
    throw new Error('No tenant on the actor — refusing to query.');
  }

  const host = AppContextHost.from(ctx);
  if (!host.supports(TrxCtx)) {
    // No transaction overlay means the operation is not transactional, and
    // a session variable would outlive the request on a pooled connection.
    throw new Error(
      'RLS requires `transactional: true` on the operation — no TrxCtx here.',
    );
  }

  const { trx } = host.with(TrxCtx);
  // Key shape: `typeorm:<data source name>`; the Firestore adapter
  // registers `firestore:default`.
  const transaction = await trx.getOrStart('typeorm:default');
  // `getClient<T = unknown>()` by contract — you name the client.
  const manager = transaction.getClient<EntityManager>();

  if (usesPostgres) {
    // `true` scopes it to this transaction, so the pooled connection is
    // clean for the next request.
    await manager.query('SELECT set_config($1, $2, true)', [
      'app.tenant_id',
      tenantId,
    ]);
  }
}

export const TenantSessionHook = defineHook(PetEntity, {
  beforeFindAndCount: async (options, ctx) => {
    await applyTenantSession(ctx);
    return options;
  },
  beforeFindOne: async (options, ctx) => {
    await applyTenantSession(ctx);
    return options;
  },
  beforeCreate: async (payload, ctx) => {
    await applyTenantSession(ctx);
    return { ...payload, tenantId: String(getActor(ctx)?.metadata?.tenantId) };
  },
});
```

## 6. Wire it, transactional

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  AuthServerGuard,
  RocketsCoreModule,
  defineResource,
} from '@concepta/rockets-core';
import { defineTypeOrmRepository } from '@concepta/rockets-repository-typeorm';
import { JwtAdapter, jwtAuth } from './auth/jwt.adapter';
import { PetEntity } from './pet.entity';
import { petCreateSchema, petResponseSchema } from './pet.schemas';
import { TenantSessionHook } from './tenant-session.hook';

@Module({
  imports: [
    RocketsCoreModule.forRoot({
      auth: jwtAuth,
      providers: [JwtAdapter],
      repository: defineTypeOrmRepository({
        type: 'sqlite',
        database: ':memory:',
        // Dev only: TypeORM alters the schema to match entities on every
        // boot. Use migrations against data you want to keep.
        synchronize: process.env.NODE_ENV !== 'production',
      }),
      actor: {
        metadata: (user) => ({ tenantId: user.claims?.tenant }),
      },
      resources: [
        defineResource({
          entity: PetEntity,
          hooks: [TenantSessionHook],
          dto: { create: petCreateSchema, response: petResponseSchema },
          operations: {
            // Every operation that must be protected by the policy opens a
            // transaction — that is what the session variable is scoped to.
            list: { transactional: true },
            read: { transactional: true },
            create: { input: petCreateSchema, transactional: true },
          },
        }),
      ],
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
})
export class AppModule {}
```

```typescript
// src/main.ts
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function bootstrap(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(process.env.PORT || 3000));
  return app;
}

// CommonJS guard (Nest's own scaffold is CommonJS). In an ESM app
// (`"type": "module"`), call `bootstrap()` directly instead.
if (require.main === module) void bootstrap();
```

## 7. Background jobs and scripts

A job has no request, so nothing sets the variable for it. Open the scope
yourself and forward `ctx` to every call:

```typescript
await TransactionScope.run({ actor: { id: 'job-runner', type: 'system' } },
  async (ctx) => {
    // Same hook path: the first repository call that forwards ctx starts the
    // transaction, and the hook sets the variable on it.
    await pets.findAndCount({ ctx });
  },
);
```

Two traps, both documented in
[CONFIGURATION §8a](https://github.com/conceptadev/rockets/blob/main/CONFIGURATION.md#8a-ctx-and-transactions--the-seam-you-must-not-miss-issue-60):

- `TransactionScope.run()` **starts no transaction by itself** and fails
  **open**: with no transaction factory registered for the store you write
  to, the body runs unprotected and nothing warns. That is why the hook
  above throws instead of skipping.
- A repository call that omits `ctx` runs with **all hooks disabled** and
  outside the transaction — so it gets a connection with no session
  variable. Under `FORCE ROW LEVEL SECURITY` it reads nothing; without it,
  it reads everything.

## 8. Verify it, don't trust it

```sql
-- As the API's role, in a fresh session:
BEGIN;
SELECT set_config('app.tenant_id', 'tenant-a', true);
SELECT count(*) FROM pet;           -- only tenant-a's rows
ROLLBACK;

BEGIN;
SELECT count(*) FROM pet;           -- 0 rows: variable unset
ROLLBACK;
```

If the second query returns rows, the policy is not in force — check that
the API's role is not a superuser and that `FORCE ROW LEVEL SECURITY` is
set.

## 9. Where this stops

- SQLite has no RLS. The compiled example above proves the seam (the hook
  reaches the transaction's client and refuses to run without one); the
  policy itself needs Postgres.
- Application-level scoping is still worth having: see
  [Multi-tenant end to end](multi-tenant.md). RLS is the floor, not a
  replacement — it cannot produce a `404` instead of an empty list, and it
  cannot stamp a tenant on write.
- The transaction key (`typeorm:default`) is a string built by the adapter,
  and nothing types it against the adapters in play.
