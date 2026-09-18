# Guide: a multi-tenant API end to end

Every file here is compiled and booted by `yarn docs:check`, and the routes
it describes are exercised with real requests. Copy it in order.

What you get: an external identity provider issues the token, its claims
become the actor's tenant list, rows are filtered and stamped by that list,
access control decides who may call what, and a boot-time policy refuses to
start if any route is left unguarded.

| Layer | Who owns it |
| --- | --- |
| Token → user | your `AuthAdapterInterface` |
| User → `Actor.metadata` | `actor.metadata` on the module |
| Rows in, rows out | `TenantStampHook` + `TenantScopeHook` |
| Who may call what | `accessControl` + grants |
| Nothing unguarded ships | `routePolicy` |

## 1. Install

```bash
yarn add @concepta/rockets-core@alpha \
  @concepta/rockets-repository-typeorm@alpha typeorm @nestjs/typeorm sqlite3 \
  @nestjs/common @nestjs/core @concepta/nestjs-access-control accesscontrol \
  jsonwebtoken reflect-metadata rxjs zod
```

Run it with the secret your adapter verifies with:

```bash
JWT_SECRET=dev-secret yarn start
```

## 2. The tenant column

The tenant is an ordinary column. Nothing about it is special until a hook
reads it.

```typescript
// src/pet.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pet')
export class PetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  /** The tenant. One shelter, many pets; a caller sees only its own. */
  @Column({ type: 'varchar', length: 64 })
  shelterId!: string;
}
```

```typescript
// src/pet.schemas.ts
import { z } from 'zod';
import { withOpenApi } from '@concepta/rockets-core';

// `shelterId` is absent from the create body ON PURPOSE: the client must not
// choose its own tenant. `TenantStampHook` writes it from the token.
export const petCreateSchema = withOpenApi(
  z.object({ name: z.string().max(100) }),
  'PetCreateDto',
);

export const petResponseSchema = withOpenApi(
  z.object({ id: z.uuid(), name: z.string(), shelterId: z.string() }),
  'PetResponseDto',
);
```

## 3. The adapter turns a token into a user

This is the only auth code you own. The claims you care about ride on
`user.claims` — `AuthorizedUser` carries them for exactly this reason, and
nothing copies them further on its own.

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

/** Claims this API expects from the identity provider. */
interface TenantClaims {
  readonly sub: string;
  readonly email?: string;
  readonly shelters?: readonly string[];
  readonly roles?: readonly string[];
}

@Injectable()
export class JwtAdapter implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(request);
    if (token === null) return { matched: false };
    try {
      const payload = verify(token, jwtSecret) as TenantClaims;
      return {
        matched: true,
        user: {
          id: payload.sub,
          sub: payload.sub,
          email: payload.email,
          // Keep the raw claims. `Actor` is transport-agnostic and will not
          // see them unless `actor.metadata` maps them across.
          claims: {
            // A provider that sends no tenant claim gets the demo shelter, so
            // this guide runs before you wire a real IdP. Delete the fallback
            // once yours issues `shelters`.
            shelters: payload.shelters ?? ['shelter-demo'],
            roles: payload.roles ?? ['user'],
          },
        },
      };
    } catch {
      return { matched: true, error: new UnauthorizedException() };
    }
  }
}

export const jwtAuth = defineAuthAdapter(JwtAdapter);
```

## 4. Claims become the actor's tenants

A hook receives an `Actor`, never the request. `actor.metadata` is the only
bridge, and without it a tenant resolver sees nothing — which is why a
scoped list comes back empty when this option is missing.

```typescript
// src/tenant.ts
import type { Actor } from '@concepta/rockets-core';
import type { AuthorizedUser } from '@concepta/rockets-core';

/** Runs on every authenticated request — keep it a pure, cheap mapping. */
export function actorMetadata(
  user: AuthorizedUser,
): Readonly<Record<string, unknown>> {
  return {
    shelters: user.claims?.shelters ?? [],
    roles: user.claims?.roles ?? [],
  };
}

/** The resolver both tenant hooks call. Fails closed: no claim, no rows. */
export function sheltersFor(actor: Actor): readonly string[] {
  const shelters = actor.metadata?.shelters;
  return Array.isArray(shelters) ? (shelters as readonly string[]) : [];
}

export function rolesFor(actor: Actor): readonly string[] {
  const roles = actor.metadata?.roles;
  return Array.isArray(roles) ? (roles as readonly string[]) : [];
}
```

## 5. Access control: who may call what

Rules are the `accesscontrol` library's; the service tells the guard which
roles the caller has. Both are app-owned — Rockets registers them, it does
not invent a role model.

```typescript
// src/access-control.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import type { AccessControlServiceInterface } from '@concepta/nestjs-access-control';
import { AccessControl } from 'accesscontrol';
import type { AuthorizedUser } from '@concepta/rockets-core';

export const acRules = new AccessControl();
acRules.grant('user').resource('pet').createOwn().readAny();
acRules.grant('admin').resource('pet').createAny().readAny().updateAny().deleteAny();

@Injectable()
export class AcService implements AccessControlServiceInterface {
  async getUser(context: ExecutionContext): Promise<unknown> {
    return context.switchToHttp().getRequest().user;
  }

  async getUserRoles(context: ExecutionContext): Promise<string[]> {
    const request = context.switchToHttp().getRequest() as {
      user?: AuthorizedUser;
    };
    const roles = request.user?.claims?.roles;
    return Array.isArray(roles) ? (roles as string[]) : [];
  }
}
```

## 6. Wire it

Four things happen here and each one is load-bearing: the actor mapping, the
two tenant hooks, the grant, and the policy that refuses to boot an
unguarded route.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  AuthServerGuard,
  RocketsCoreModule,
  TenantScopeHook,
  TenantStampHook,
  defineResource,
} from '@concepta/rockets-core';
import { defineTypeOrmRepository } from '@concepta/rockets-repository-typeorm';
import { AcService, acRules } from './access-control';
import { JwtAdapter, jwtAuth } from './auth/jwt.adapter';
import { PetEntity } from './pet.entity';
import { petCreateSchema, petResponseSchema } from './pet.schemas';
import { actorMetadata, sheltersFor } from './tenant';

// One resolver, two hooks: the stamp writes the tenant on create, the scope
// filters every read. Bind both to the entity — an unbound hook fires for
// sibling entities in the same request and scopes the wrong table.
const ShelterStamp = TenantStampHook.for<PetEntity>(PetEntity, {
  tenantKey: 'shelterId',
  resolve: sheltersFor,
});

const ShelterScope = TenantScopeHook.for<PetEntity>(PetEntity, {
  tenantKey: 'shelterId',
  resolve: sheltersFor,
});

@Module({
  imports: [
    RocketsCoreModule.forRoot({
      auth: jwtAuth,
      providers: [JwtAdapter, AcService],
      repository: defineTypeOrmRepository({
        type: 'sqlite',
        database: ':memory:',
        // Dev only: TypeORM alters the schema to match entities on every
        // boot. Use migrations against data you want to keep.
        synchronize: process.env.NODE_ENV !== 'production',
      }),
      // Without this the hooks' resolver sees an actor with an id and
      // nothing else, and every scoped list comes back empty.
      actor: { metadata: actorMetadata },
      accessControl: {
        service: new AcService(),
        settings: { rules: acRules },
        // Refuse to boot if a generated authenticated route carries no
        // grant. Upstream's default answer for a missing grant is "allow".
        enforceGrants: true,
      },
      // Checked over every discovered route at boot, including controllers
      // this app did not generate.
      routePolicy: { requireAuth: true, requireAcl: true },
      resources: [
        defineResource({
          entity: PetEntity,
          acl: { resource: 'pet' },
          hooks: [ShelterStamp, ShelterScope],
          dto: { create: petCreateSchema, response: petResponseSchema },
          operations: {
            list: {},
            read: {},
            create: { input: petCreateSchema },
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

## 7. What each layer refuses

| Attempt | Answer | Enforced by |
| --- | --- | --- |
| No token | `401` | `AuthServerGuard` |
| Token without the granted role | `403` | `accessControl` grants |
| `POST /pets` with someone else's `shelterId` in the body | the field is not in the create schema; the stamp writes the token's tenant | `petCreateSchema` + `TenantStampHook` |
| `GET /pets` from a caller in no tenant | `200` with an empty list — never the whole table | `TenantScopeHook` |
| `GET /pets/:id` for another tenant's row | `404` | `TenantScopeHook` |
| A new route with no grant | the app does not start | `enforceGrants` + `routePolicy` |

## 8. Where this stops

- `TenantScopeHook` overrides `beforeFindAndCount` and `beforeFindOne`. A
  hand-written `repository.find({ ctx })` is **not** scoped — scope it
  yourself or go through the generated routes.
- Its rejections are Rockets exceptions. Register
  `RocketsCoreExceptionsFilter` in the app, or a `403` from the stamp hook
  reaches the client as `500`.
- The actor mapping runs again for the parent lookup on a sub-resource
  route, so keep it pure and cheap.
- Database-level enforcement (a tenant that survives a hand-written query)
  is a different tool: see
  [Row-level security](row-level-security.md).

Reference: [CONFIGURATION.md §5b](https://github.com/conceptadev/rockets/blob/main/CONFIGURATION.md#5b-tenantscopehook--fail-closed-tenant-row-scoping-issue-69)
for the hook's full contract, and
[§5a](https://github.com/conceptadev/rockets/blob/main/CONFIGURATION.md#5a-acl--access-control-on-resources-and-operations-issue-51)
for `acl`.
