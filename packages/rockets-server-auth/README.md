# @concepta/rockets-auth

[![NPM](https://img.shields.io/npm/v/@concepta/rockets-auth)](https://www.npmjs.com/package/@concepta/rockets-auth)
[![NestJS](https://img.shields.io/badge/NestJS-12-ea2845?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> Complete built-in auth system for Rockets: signup, login, password recovery,
> OTP, invitations, roles, admin user CRUD — wired as a single
> `defineRocketsAuth()` integration.

**Status:** pre-1.0 preview (`0.0.1-dev.0`, published on npm as
`@concepta/rockets-auth@alpha`). Public shapes may still change before 1.0;
the OAuth submodule is parked pending upstream v8 ports (see
[Known limitations](#known-limitations)).

---

## 1. Introduction

`@concepta/rockets-auth` is what you compose with `@concepta/rockets` when your
application owns its users instead of delegating authentication to an external
IdP.

It composes the v8 line of `@concepta/nestjs-*` **identity motors** (`user`,
`password`, `otp`, `role`, `invitation`, `federated`, `email`, `event`, plus
`authentication`) into a single configuration shape and exposes them as an
`AuthBootstrap` for `RocketsModule.forRoot({ auth: ... })` from
`@concepta/rockets`. It does **not** replace repository/CRUD/hook motors — those
still come from core (which re-exports the `@concepta/nestjs-*` motors).

### What it gives you

- **HTTP routes** (mounted by the bundle):
  - `POST /token/password` — login. `POST /token/refresh` — refresh.
  - `POST /recovery/login`, `POST /recovery/password`,
    `POST /recovery/passcode`, `PATCH /recovery/password` —
    enumeration-safe login/password recovery and password reset.
  - `PATCH /me` (password change) and the rest of `/me` from `@concepta/rockets`.
  - `POST /otp`, `PATCH /otp` — OTP issue / verify.
  - `POST /signup` — user signup (wired through `userCrud`).
  - Admin: `/admin/users`, `/admin/users/:userId/roles`, `/admin/invitations` (+
    accept / revoke / reattempt).
  - `/invitation-acceptance` for invited users.
- **Provider**: `RocketsJwtAuthAdapter` — Rockets-spec `AuthAdapterInterface`
  that validates the JWT issued by `/token/password` and produces an
  `AuthorizedUser` with `userRoles`.
- **Access control** re-exports from `@concepta/nestjs-access-control` so app
  code single-sources from this package.
- **Customisation seams**: per-controller decorator extras
  (`controller.classDecorators`, `controller.routes[*].decorators`), abstract
  handler classes for every admin operation, port overrides for every
  cross-module command/query.

### When to use this package

- You want a complete user system out of the box (signup, login, OTP, password
  recovery, roles, invitations, admin endpoints) and you don't want to glue
  seven modules together yourself.
- You will deploy in environments where the application owns the identity store.

### When NOT to use this package

- Users live in an external IdP (Firebase, Auth0, Okta, custom JWT) → use
  `@concepta/rockets` + the matching adapter.
- You only need login + a custom user table without OTP / invitations / admin →
  drop to `@concepta/rockets` and write a small JWT adapter yourself.

---

## 2. Get Started

### Install

```bash
yarn add @concepta/rockets-auth@alpha @concepta/rockets@alpha @concepta/rockets-core@alpha \
  @nestjs/common @nestjs/core @nestjs/cqrs @nestjs/swagger @nestjs/jwt @nestjs/passport \
  class-transformer class-validator reflect-metadata rxjs
```

Bring the upstream `@concepta/nestjs-*` packages and a repository adapter your
app supports (e.g. `@concepta/rockets-repository-typeorm` + `typeorm`).

### Minimal working example

```typescript
import { Module } from '@nestjs/common';
import { EventModule } from '@concepta/nestjs-event';
import { RocketsModule } from '@concepta/rockets';
import { defineRocketsAuth } from '@concepta/rockets-auth';
import { defineTypeOrmRepository } from '@concepta/rockets-repository-typeorm';

import {
  UserEntity,
  UserCredentialEntity,
  UserOtpEntity,
  RoleEntity,
  UserRoleEntity,
  FederatedEntity,
  InvitationEntity,
  UserDto,
  UserCreateDto,
  SampleUserUpdateDto,
} from './user';
import {
  UserMetadataEntity,
  UserMetadataCreateDto,
  UserMetadataUpdateDto,
} from './user/metadata';
import { RoleDto, RoleCreateDto, RoleUpdateDto } from './role';

// The auth integration contributes this repository and all auth-owned rows.
const repo = defineTypeOrmRepository({
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  dropSchema: true,
});

const rocketsAuthInput = {
  persistence: {
    module: repo,
    entities: {
      user: UserEntity,
      userCredentials: UserCredentialEntity,
      userOtp: UserOtpEntity,
      role: RoleEntity,
      userRole: UserRoleEntity,
      federatedIdentity: FederatedEntity,
    },
  },
  invitationEntity: InvitationEntity,
  userMetadata: {
    entity: UserMetadataEntity,
    createDto: UserMetadataCreateDto,
    updateDto: UserMetadataUpdateDto,
  },
  userCrud: {
    model: UserDto,
    dto: { createOne: UserCreateDto, updateOne: SampleUserUpdateDto },
  },
  roleCrud: {
    model: RoleDto,
    dto: { createOne: RoleCreateDto, updateOne: RoleUpdateDto },
  },
  useFactory: () => ({
    services: {
      mailerService: {
        sendMail: async (opts) => {
          /* wire your real SMTP / SES adapter */
        },
      },
    },
    authentication: {
      ports: {
        recoveryNotification: {
          sendRecoverLoginNotificationCommand: SendRecoverLoginCmd,
          sendRecoverPasswordNotificationCommand: SendRecoverPasswordCmd,
          sendPasswordUpdatedNotificationCommand: SendPasswordUpdatedCmd,
        },
        verifyNotification: {
          sendVerifyNotificationCommand: SendVerifyCmd,
        },
      },
    },
    settings: {
      role: { adminRoleName: 'admin', defaultUserRoleName: 'user' },
      email: {
        from: 'noreply@example.com',
        baseUrl: 'http://localhost:3000',
        templates: {
          /* ... */
        },
      },
      otp: {
        assignment: 'userOtp' as const,
        category: 'auth-login',
        type: 'uuid' as const,
        expiresIn: '1h',
      },
    },
  }),
};

const rocketsAuth = defineRocketsAuth(rocketsAuthInput);

@Module({
  imports: [
    EventModule.forRoot({}),
    RocketsModule.forRoot({
      auth: rocketsAuth,
      resources: [
        /* your application defineResource bundles */
      ],
    }),
  ],
})
export class AppModule {}
```

`defineRocketsAuth()` owns its composition boundary: it contributes the auth
resources, root repository, `/me` metadata contract, and guard preference.
Explicit options on `RocketsModule` or `createServer()` override contributed
defaults. Run `yarn sample-auth:dev` from the monorepo root for a full working
app.

---

## 3. How-to Guides

### Reuse the user's roles inside Access Control

`AccessControlServiceInterface` comes from upstream
`@concepta/nestjs-access-control` (not re-exported by this package — import it
directly). Implement `getUserRoles` by reading `userRoles` off the request —
`RocketsJwtAuthAdapter` populates that shape from the user-role join
automatically.

```typescript
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AccessControlServiceInterface } from '@concepta/nestjs-access-control';

@Injectable()
export class ACService implements AccessControlServiceInterface {
  async getUser<T>(ctx: ExecutionContext): Promise<T> {
    return ctx.switchToHttp().getRequest().user as T;
  }

  async getUserRoles(ctx: ExecutionContext): Promise<string[]> {
    const user = await this.getUser<{
      userRoles?: { role: { name: string } }[];
    }>(ctx);
    if (!user) throw new UnauthorizedException();
    return user.userRoles?.map((ur) => ur.role.name) ?? [];
  }
}
```

Pass it to `accessControl.service` inside `defineRocketsAuth({ ... })`.

### Override a single admin handler (e.g. custom signup logic)

Each admin operation has an abstract base class. Extend, then point the override
slot at it.

```typescript
import {
  AbstractSignupUserHandler,
  SignupUserCommand,
} from '@concepta/rockets-auth';

@CommandHandler(SignupUserCommand)
export class SignupWithReferralHandler extends AbstractSignupUserHandler {
  async execute(cmd: SignupUserCommand) {
    const user = await super.execute(cmd);
    await this.referralService.attach(user.id, cmd.referralCode);
    return user;
  }
}

defineRocketsAuth({
  // ...
  userCrud: {
    model: UserDto,
    dto: { createOne: UserCreateDto, updateOne: SampleUserUpdateDto },
    handlers: { signupHandler: SignupWithReferralHandler },
  },
});
```

Available slots: `signupHandler`, `adminList`, `adminRead`, `adminUpdate`,
`adminDelete` (all under `userCrud.handlers`).

### Disable specific controllers

When you ship your own variant, opt the built-in out through the
`defineRocketsAuth` input:

```typescript
defineRocketsAuth({
  // ...
  disableController: { admin: true, invitation: true },
});
```

Available flags: `otp`, `signup`, `admin`, `adminRoles`, `invitation`,
`invitationAcceptance`, `invitationRevocation`, `invitationReattempt`,
`mePassword`, `token`, `recovery`. (The `disableController` field on
`RocketsAuthModule.forRootAsync` directly accepts the same shape;
`defineRocketsAuth` propagates it.)

### Skip the global guard

`defineRocketsAuth` defaults the Rockets guard off because the upstream
`AuthenticationModule` already installs its own JWT `APP_GUARD`. For a mixed
auth chain, make Rockets own the ordered adapters and turn the upstream guard
off:

```typescript
defineRocketsAuth({
  // ...
  rocketsDefaults: { enableGlobalGuard: true },
  auth: { appGuard: false },
});
```

### Customise a controller without subclassing

Every factory-built controller accepts a `controller.classDecorators` array and
a `controller.routes[*].decorators` map. Use them to attach throttling, ACL
decorators, or rate limits.

```typescript
defineRocketsAuth({
  // ...
  otp: {
    controller: {
      routes: {
        issue: { decorators: [Throttle({ default: { limit: 3, ttl: 60 } })] },
        verify: { decorators: [Throttle({ default: { limit: 10, ttl: 60 } })] },
      },
    },
  },
});
```

The same pattern applies to `extras.auth.controller` (for `/me/password`),
`extras.invitation.controllers.*`, and `extras.role.controller` (admin role
mgmt).

---

## 4. Reference

### Upstream engine (identity motors)

| `@concepta/nestjs-*` motor | Role in `defineRocketsAuth`                          |
| -------------------------- | ---------------------------------------------------- |
| `user`                     | User CRUD, signup, admin users                       |
| `password`                 | Login, refresh, password change, recovery            |
| `otp`                      | OTP issue / verify                                   |
| `role`                     | Role admin CRUD                                      |
| `invitation`               | Invitations + acceptance                             |
| `federated`                | Federated identity rows                              |
| `email` / `event`          | Mailer hooks, domain events                          |
| `authentication`           | Shared auth types/utilities                          |
| `access-control`           | RBAC (re-exported from this package for convenience) |

**Shared stack (path A and B):** repository + CRUD + hooks still run through
`@concepta/rockets-core` and the same `repository` / `resources[]` options on
`RocketsModule.forRoot`.

**This package does not depend on `@concepta/rockets`** — your app imports both
when you need built-in auth HTTP and `/me`.

### Entry points

| Symbol                                                         | Purpose                                                                                                                                                                           |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineRocketsAuth(input)`                                     | Returns a complete `AuthBootstrap` for `createServer({ auth })` or `RocketsModule.forRoot({ auth })`, including owned persistence rows, repository, metadata, and guard defaults. |
| `buildRocketsAuthResources(persistence, invitationEntity?)`    | Advanced helper used internally by `defineRocketsAuth`; exposed for lower-level core composition.                                                                                 |
| `RocketsAuthModule.forRoot(options)` / `forRootAsync(options)` | Direct registration. Use only when you need to mount the auth module outside the `RocketsModule` composition.                                                                     |
| `RocketsJwtAuthAdapter`                                        | The default JWT adapter validated by the chain. Picked by `defineRocketsAuth` unless `authAdapter` is overridden.                                                                 |

### `defineRocketsAuth` input

| Field                               | Type                                                                         | Required | Purpose                                                                                                                                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `persistence.module`                | `RepositoryModuleInterface`                                                  | yes      | Repository contributed to the surrounding Rockets server — typically `defineTypeOrmRepository(...)`, or a lower-level repository module when the host owns root registration.                              |
| `persistence.entities`              | `{ user, userCredentials?, userOtp?, role?, userRole?, federatedIdentity? }` | yes      | **Your** TypeORM entity classes for auth tables. No `@concepta/nestjs-typeorm-ext` — declare columns explicitly (see `examples/sample-server-auth`).                                                       |
| `invitationEntity`                  | `Type`                                                                       | optional | Adds an `invitation` repository row + enables invitation routes.                                                                                                                                           |
| `userMetadata`                      | `RocketsUserMetadataConfig`                                                  | yes      | Forwarded to `/me`; also used as the default `userCrud.userMetadataConfig`.                                                                                                                                |
| `userCrud`                          | `UserCrudOptionsExtrasInterface`                                             | yes      | `model`, `dto.createOne` / `updateOne`, `handlers`, controller extras.                                                                                                                                     |
| `roleCrud`                          | `RoleCrudOptionsExtrasInterface`                                             | optional | Same shape, for the role admin routes.                                                                                                                                                                     |
| `authAdapter`                       | `Type<AuthAdapterInterface>`                                                 | optional | Override the JWT adapter (e.g. inject a custom claim transformer).                                                                                                                                         |
| `rocketsDefaults.enableGlobalGuard` | `boolean`                                                                    | optional | Override the contributed Rockets guard default (`false`; upstream JWT guard owns built-in-auth requests).                                                                                                  |
| All other fields                    | inherited from `RocketsAuthOptionsInterface`                                 | optional | `useFactory` / `useExisting`, plus `settings`, `authentication`, `user`, `password`, `otp`, `email`, `crud`, `role`, `invitation`, `federated`, `services`, `accessControl`, `disableController`, `ports`. |

### `RocketsAuthModule.forRoot(options)` — top-level options

| Field                                                                         | Purpose                                                                                                                                                                    |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                                                                    | Rockets-specific settings (role names, OTP defaults, email templates).                                                                                                     |
| `authentication`                                                              | Forwarded to `@concepta/nestjs-authentication`. Includes `settings.{jwt, strategies, mfa, guards}` and `ports.*`. Notification ports must be supplied (no silent default). |
| `user`, `password`, `otp`, `email`, `crud`, `role`, `federated`, `invitation` | Per-module config blocks, forwarded as-is to upstream modules.                                                                                                             |
| `services.mailerService`                                                      | Required mailer adapter. Use a logger fallback for dev.                                                                                                                    |
| `services.userAccessQueryService`                                             | Optional `CanAccess` for access-control queries.                                                                                                                           |
| `swagger`                                                                     | Forwarded to `SwaggerUiModule` from `@concepta/rockets-core`.                                                                                                              |

### Module-level extras

| Field                                                                                 | Purpose                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accessControl`                                                                       | `AccessControlOptionsInterface` + `imports` + `queryServices` — enables the global ACL guard wiring.                                                                                        |
| `disableController`                                                                   | Drop built-in controllers (`recovery`, `otp`, `signup`, `admin`, `adminRoles`, `invitation`, `invitationAcceptance`, `invitationRevocation`, `invitationReattempt`, `mePassword`, `token`). |
| `throttling`                                                                          | Request-throttling options for the guard scoped to the auth-owned public routes (signup, login, recovery, otp, invitation acceptance) — a coarse per-IP ceiling plus fine per-`(ip, account)` limits. No app-wide `APP_GUARD` is registered. Pass `false` to opt out.                                                           |
| `ports`                                                                               | `RocketsAuthPortsConfigInterface` — per-handler overrides for cross-module Command/Query plumbing.                                                                                          |
| `auth.appGuard`                                                                       | Override the global `APP_GUARD` from `AuthenticationModule`.                                                                                                                                |
| `auth.controller` / `otp.controller` / `invitation.controllers.*` / `role.controller` | Per-controller decorator extras (`classDecorators`, `routes[*].decorators`).                                                                                                                |

### Domain re-exports

Every public type and CQRS class from the auth, user, otp, role, and invitation
domains is re-exported under the package root:

- **Auth**: `buildMePasswordController` factory (`/me/password`),
  `RocketsAuthTokenController`, `RocketsJwtAuthAdapter`.
- **User**: `SignupUserCommand`, `AbstractSignupUserHandler`,
  `AbstractAdminUserListHandler`, `AbstractAdminUserReadHandler`,
  `AbstractAdminUserUpdateHandler`, `AbstractAdminDeleteUserHandler`,
  `RocketsAuthUserInterface`, `RocketsAuthUserMetadata*Interface`.
- **Role**: `RocketsAuthRoleInterface`, role CRUD entities and DTOs.
- **OTP**: `buildRocketsAuthOtpController` factory, OTP CQRS handlers
  (`RocketsCreateOtpHandler`, `RocketsValidateOtpHandler`, …) and DTOs.
- **Invitation**: invitation entities, DTOs, controllers, and the four
  factory-built controllers (`invitation`, `acceptance`, `revocation`,
  `reattempt`).

### Access-control re-exports

Saved here so consumers don't dual-import from
`@concepta/nestjs-access-control`:

`AccessControlModule`, `AccessControlGuard`, `AccessControlFilter`,
`AccessControlContext`, `AccessControlService`, every
`@AccessControl{Create,Read,Update,Replace,Delete,Recover}*` decorator,
`@AccessControlGrant`, `@AccessControlQuery`, `ActionEnum`, `PossessionEnum`,
`CanAccess`, `AccessControlOptionsInterface`, `AccessControlContextInterface`.
Other upstream symbols (e.g. `AccessControlServiceInterface`) are not
re-exported — import them directly from `@concepta/nestjs-access-control`.

### Known limitations

- **OAuth providers (Apple, Google, GitHub)** are deferred — upstream
  `@concepta/nestjs-auth-{apple,google,github,router}` have not been ported to
  v8. `extras.auth.guards` remains as forward-compatible plumbing, but Rockets
  does not register OAuth routes until compatible upstream providers ship.
- **Email and event modules** are on v7 (`@concepta/nestjs-email@7.0.0-alpha.10`,
  `@concepta/nestjs-event@7.0.0-alpha.10`) while the rest of the stack —
  including `@concepta/nestjs-access-control` — is on v8. The cross-version mix
  is intentional while the v8 email/event ports are in flight. No code change
  required when those land.
- **Persistence entities are app-owned.** Do not use `@concepta/nestjs-typeorm-ext`
  (v7-only). Supply TypeORM entity classes (or zod-compiled entities) via
  `defineRocketsAuth({ persistence: { entities } })`. See
  `examples/sample-server-auth/src/shared/persistence/` and
  `src/modules/user/entities/`.

Generate OpenAPI from the application entry module with Nest's
`SwaggerModule.createDocument()`. The package cannot infer a consumer's full
module graph, prefixes, or document settings, so it intentionally ships no
standalone generator CLI.

---

## License

BSD-3-Clause
