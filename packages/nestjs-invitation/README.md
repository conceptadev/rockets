# Rockets NestJS Invitation

Create/validate invitations for your rockets modules with ease.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-invitation)](https://www.npmjs.com/package/@concepta/nestjs-invitation)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-invitation)](https://www.npmjs.com/package/@concepta/nestjs-invitation)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Introduction

Invitations are useful for create users, grant roles... You can integrate this invitation module with other rockets modules (e.g. users, roles, emails...) in order ease invitations.

## Features

- Create users by **_POST /invitation_**
- Get invites by **_GET /invitation_**
- Get one invite by **_GET /invitation/{id}_**
- Delete one invite by **_DELETE /invitation/{id}_**
- Validate one invite by **_GET /invitation-acceptance/{id}_**
- Claim one invite by **_PATCH /invitation-acceptance/{id}_**

For more details check invitation modules [swagger](http://host:port/api/#/invitation)

## Installation

$ `yarn add @concepta/nestjs-invitation`

At your `app.module.ts` you should configure OTP, USER, EMAIL modules with it's entities and services. Look at `packages/nestjs-invitation/src/__fixtures__/app.module.fixture.ts` for examples how to use it.

```typescript
OtpModule.forRoot({
      entities: {
        'user-otp': {
          entity: UserOtpEntity,
        },
      },
    }),
UserModule.forRoot({
  settings: {
    invitationRequestEvent: InvitationAcceptedEventAsync,
  },
  entities: {
    user: {
      entity: UserEntity,
    },
  },
}),
EmailModule.register({
  mailerService: MailerService,
})
```