# Guide: unrestricted access for an admin role, same endpoint

`GET /pets` returns the caller's own rows. An administrator must get every
row — from the same route, without a second controller and without a role
name buried inside a shared hook.

Every file is compiled, booted and exercised by `yarn docs:check`.

## Why not put the role check in the built-in hook

`OwnerScopeHook` filters by an owner column and knows nothing about roles.
That is deliberate: a generic hook with an `admin` bypass would apply that
bypass to every application that installs it, and the name of a privileged
role is app policy. So the widening lives in **your** hook, which the
framework treats like any other.

## 1. Install

```bash
yarn add @concepta/rockets-core@alpha \
  @concepta/rockets-repository-typeorm@alpha typeorm @nestjs/typeorm sqlite3 \
  @nestjs/common @nestjs/core jsonwebtoken reflect-metadata rxjs zod
```

```bash
JWT_SECRET=dev-secret yarn start
```

## 2. The entity and schemas

```typescript
// src/pet.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pet')
export class PetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  /** Owner. Stamped from the token, never accepted from the body. */
  @Column({ type: 'varchar', length: 64 })
  userId!: string;
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
  z.object({ id: z.uuid(), name: z.string(), userId: z.string() }),
  'PetResponseDto',
);
```

## 3. Roles reach the actor

A hook sees an `Actor`, not the request — so the roles have to be mapped
across explicitly. Nothing does it for you.

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
        roles?: readonly string[];
      };
      return {
        matched: true,
        user: {
          id: payload.sub,
          sub: payload.sub,
          claims: { roles: payload.roles ?? ['user'] },
        },
      };
    } catch {
      return { matched: true, error: new UnauthorizedException() };
    }
  }
}

export const jwtAuth = defineAuthAdapter(JwtAdapter);
```

## 4. One hook, two behaviours

Ownership is the default; the admin role removes the filter. The filter is
added by the hook, so "unrestricted" means *returning the options
untouched* — there is nothing to subtract.

```typescript
// src/owner-or-admin.hook.ts
import {
  Where,
  defineHook,
  getActor,
  type EntityHookContext,
} from '@concepta/rockets-core';
import { PetEntity } from './pet.entity';

/** App policy, in app code: which role sees everything. */
const ADMIN_ROLE = 'admin';

// `getActor(ctx)`, never `ctx.actor`: the actor is an overlay on the
// context, so the plain field is always undefined and every caller would
// look like an administrator of nothing.
function isAdmin(ctx?: EntityHookContext): boolean {
  const roles = getActor(ctx)?.metadata?.roles;
  return Array.isArray(roles) && roles.includes(ADMIN_ROLE);
}

function ownerId(ctx?: EntityHookContext): string {
  const id = getActor(ctx)?.id;
  if (typeof id !== 'string' || id === '') {
    // Fail closed. An unauthenticated request should have been stopped by
    // the guard; if it reaches here, scope to nobody rather than everybody.
    throw new Error('No actor — refusing to run an unscoped query.');
  }
  return id;
}

export const OwnerOrAdminScope = defineHook(PetEntity, {
  // List: an admin gets the options unchanged; everyone else gets the owner
  // clause ANDed onto whatever the client asked for — replacing `where`
  // would silently drop the caller's own filters.
  beforeFindAndCount: (options, ctx) => {
    if (isAdmin(ctx)) return options;
    const owner = Where.eq<PetEntity>('userId', ownerId(ctx));
    return {
      ...options,
      where: options.where ? Where.and(options.where, owner) : owner,
    };
  },

  // Read / update / delete all resolve one row through findOne, so scoping
  // it here covers "can this caller touch that id" in one place.
  beforeFindOne: (options, ctx) => {
    if (isAdmin(ctx)) return options;
    const owner = Where.eq<PetEntity>('userId', ownerId(ctx));
    return {
      ...options,
      where: options.where ? Where.and(options.where, owner) : owner,
    };
  },

  // Writes are never "unrestricted": an admin creating a row still owns it.
  beforeCreate: (payload, ctx) => ({ ...payload, userId: ownerId(ctx) }),
});
```

## 5. Wire it

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
import { OwnerOrAdminScope } from './owner-or-admin.hook';
import { PetEntity } from './pet.entity';
import { petCreateSchema, petResponseSchema } from './pet.schemas';

@Module({
  imports: [
    RocketsCoreModule.forRoot({
      auth: jwtAuth,
      providers: [JwtAdapter],
      repository: defineTypeOrmRepository({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
      }),
      // The hook reads roles off the actor, so map them here.
      actor: { metadata: (user) => ({ roles: user.claims?.roles ?? [] }) },
      resources: [
        defineResource({
          entity: PetEntity,
          // This hook replaces OwnerScopeHook — do not stack both, or the
          // built-in filter re-narrows what the admin branch widened.
          hooks: [OwnerOrAdminScope],
          dto: { create: petCreateSchema, response: petResponseSchema },
          operations: {
            list: {},
            read: {},
            create: { input: petCreateSchema },
            delete: {},
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

## 6. What each caller sees

| Caller | `GET /pets` | `GET /pets/:id` of another user | `POST /pets` |
| --- | --- | --- | --- |
| `roles: ['user']` | own rows | `404` | row owned by the caller |
| `roles: ['admin']` | every row | the row | row owned by the admin |
| no token | `401` | `401` | `401` |

An admin gets `404` for an id that does not exist at all — same answer as a
non-admin asking for someone else's row, which is the point: the response
does not reveal whether the row exists.

## 7. If you also use access control

Grants answer *may this caller call this route*; the hook answers *which
rows come back*. They are different questions and you usually want both:

```typescript
acRules.grant('user').resource('pet').readAny().createOwn();
acRules.grant('admin').resource('pet').readAny().createAny().deleteAny();
```

`readAny` on both roles is correct here — the row filtering is the hook's
job, not the grant's. Reserve `readOwn` for the case where you want
upstream's possession check to refuse the route outright. Full rules:
[CONFIGURATION §5a](https://github.com/conceptadev/rockets/blob/main/CONFIGURATION.md#5a-acl--access-control-on-resources-and-operations-issue-51).

## 8. Where this stops

- The hook widens reads. It does not widen writes, and it should not: an
  admin updating someone else's row is a different operation with a
  different audit story — give it its own route.
- Hooks are skipped entirely when a repository call omits `ctx`, so a
  hand-written service is not scoped by this hook. Forward `ctx` from the
  hook's second argument or the CRUD context.
- For a tenant (many users, one shared scope) rather than an owner, see
  [Multi-tenant end to end](multi-tenant.md).
