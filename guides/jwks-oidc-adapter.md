# Guide: a JWKS / OIDC auth adapter (Entra ID, Auth0, Keycloak)

An external identity provider signs tokens with a rotating key set it
publishes over HTTPS. This adapter verifies against that key set and
rejects anything whose issuer, audience or lifetime is wrong.

Every file is compiled, booted and exercised by `yarn docs:check`.

## What the provider gives you

| Provider | Issuer | JWKS |
| --- | --- | --- |
| Microsoft Entra ID | `https://login.microsoftonline.com/<tenant>/v2.0` | `<issuer>/discovery/v2.0/keys` |
| Auth0 | `https://<domain>/` | `<issuer>.well-known/jwks.json` |
| Keycloak | `https://<host>/realms/<realm>` | `<issuer>/protocol/openid-connect/certs` |

Both values come from the provider's discovery document
(`<issuer>/.well-known/openid-configuration`) — read them from there rather
than hard-coding a path.

## 1. Install

```bash
yarn add @concepta/rockets-core@alpha \
  @concepta/rockets-repository-typeorm@alpha typeorm @nestjs/typeorm sqlite3 \
  @nestjs/common @nestjs/core jose jsonwebtoken reflect-metadata rxjs zod
```

```bash
OIDC_ISSUER=https://login.microsoftonline.com/<tenant>/v2.0 \
OIDC_AUDIENCE=api://pets \
JWT_SECRET=dev-secret yarn start
```

`JWT_SECRET` is the development path described in step 3. In production set
only the two `OIDC_*` variables.

## 2. The adapter

`createRemoteJWKSet` caches the key set and refetches on an unknown `kid`,
which is what makes rotation a non-event. Create it **once** — one per
request would hammer the provider and lose the cache.

```typescript
// src/auth/jwks.adapter.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { verify as verifyHs256 } from 'jsonwebtoken';
import {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
  defineAuthAdapter,
  extractBearerToken,
} from '@concepta/rockets-core';

const issuer = process.env.OIDC_ISSUER;
const audience = process.env.OIDC_AUDIENCE;

/**
 * One key set for the process. It caches keys, and refetches when a token
 * arrives with a `kid` it has not seen — so a provider rotating its signing
 * key needs no deploy here.
 */
const remoteKeys =
  issuer === undefined
    ? null
    : createRemoteJWKSet(
        new URL(`${issuer.replace(/\/$/, '')}/.well-known/jwks.json`),
        // Bound the blast radius of a provider outage: keys are reused for
        // 10 minutes, and a rotation is picked up within that window.
        { cacheMaxAge: 600_000, cooldownDuration: 30_000 },
      );

/** Claims this API relies on. Everything else stays in `claims`. */
interface OidcClaims extends JWTPayload {
  readonly email?: string;
  readonly roles?: readonly string[];
  /** Entra ID sends the tenant as `tid`. */
  readonly tid?: string;
}

@Injectable()
export class JwksAdapter implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(request);
    if (token === null) return { matched: false };

    try {
      const claims = await this.verifyToken(token);
      const subject = claims.sub;
      if (subject === undefined) {
        // No subject, no identity. Do not invent one from email.
        return { matched: true, error: new UnauthorizedException() };
      }
      return {
        matched: true,
        user: {
          id: subject,
          sub: subject,
          email: claims.email,
          claims: {
            roles: claims.roles ?? [],
            tenant: claims.tid,
            issuer: claims.iss,
          },
        },
      };
    } catch {
      // Signature, issuer, audience, expiry: all one answer to the client.
      return { matched: true, error: new UnauthorizedException() };
    }
  }

  private async verifyToken(token: string): Promise<OidcClaims> {
    if (remoteKeys !== null) {
      // `issuer` and `audience` are checked by jose, not by us: a token
      // signed by the right provider for a DIFFERENT audience is a valid
      // token and the wrong one for this API.
      const { payload } = await jwtVerify(token, remoteKeys, {
        issuer,
        audience,
        // Tolerate small clock drift between the provider and this host.
        clockTolerance: 5,
      });
      return payload as OidcClaims;
    }

    // Development path: no provider configured, so fall back to a shared
    // secret. Delete this branch, or refuse to start without OIDC_ISSUER,
    // before you deploy.
    const secret = process.env.JWT_SECRET;
    if (secret === undefined || secret === '') {
      throw new Error('Neither OIDC_ISSUER nor JWT_SECRET is set.');
    }
    return verifyHs256(token, secret) as OidcClaims;
  }
}

export const jwksAuth = defineAuthAdapter(JwksAdapter);
```

## 3. Wire it

```typescript
// src/pet.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pet')
export class PetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;
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
  z.object({ id: z.uuid(), name: z.string() }),
  'PetResponseDto',
);
```

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
import { JwksAdapter, jwksAuth } from './auth/jwks.adapter';
import { PetEntity } from './pet.entity';
import { petCreateSchema, petResponseSchema } from './pet.schemas';

@Module({
  imports: [
    RocketsCoreModule.forRoot({
      auth: jwksAuth,
      providers: [JwksAdapter],
      repository: defineTypeOrmRepository({
        type: 'sqlite',
        database: ':memory:',
        // Dev only: TypeORM alters the schema to match entities on every
        // boot. Use migrations against data you want to keep.
        synchronize: process.env.NODE_ENV !== 'production',
      }),
      // The provider's claims are the app's to interpret; keep the mapping
      // pure and cheap — it runs on every authenticated request.
      actor: {
        metadata: (user) => ({
          roles: user.claims?.roles ?? [],
          tenant: user.claims?.tenant,
        }),
      },
      resources: [
        defineResource({
          entity: PetEntity,
          dto: { create: petCreateSchema, response: petResponseSchema },
          operations: { list: {}, read: {}, create: { input: petCreateSchema } },
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

## 4. Run it alongside another adapter

Adapters are a chain in guard priority order: the first one that claims the
request (`matched: true`) answers for it. A service-to-service API key next
to human OIDC logins is two entries:

```typescript
auth: [apiKeyAuth, jwksAuth];
```

`matched: false` means "not my kind of credential, try the next"; a
`matched: true` with an error stops the chain with that error. Returning
`matched: true` for a credential you cannot verify is what silently blocks
every later adapter.

## 5. What this refuses, and why it matters

| Token | Answer |
| --- | --- |
| Signed by an unknown key | `401` — the `kid` is not in the provider's key set |
| Right provider, different audience | `401` — a valid token for another API |
| Right audience, wrong issuer | `401` — a token minted by another tenant |
| Expired, or `nbf` in the future | `401` — with 5s of clock tolerance |
| No `sub` claim | `401` — there is no identity to act as |

The audience check is the one people skip. Without it, any token the
provider issued for any of its applications opens this API.

## 6. Where this stops

- Nothing here authorizes. Roles arrive on `Actor.metadata`; deciding what
  they may do is [access control](https://github.com/conceptadev/rockets/blob/main/CONFIGURATION.md#5a-acl--access-control-on-resources-and-operations-issue-51)
  plus, for rows, a scope hook —
  see [unrestricted admin access](admin-unrestricted-access.md).
- Token revocation is not a thing a JWKS check can see: a token stays valid
  until it expires. Keep lifetimes short, or verify a session on top.
- Firebase has its own adapter package
  ([`@concepta/rockets-adapter-firebase`](https://www.npmjs.com/package/@concepta/rockets-adapter-firebase))
  — use it instead of this one there; it also handles session cookies and
  revocation checks.
- The development HS256 branch exists so this guide runs without a
  provider. Remove it before you deploy.
