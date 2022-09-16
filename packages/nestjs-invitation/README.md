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

$ `yarn add @concepta/nestjs-invitation @concepta/nestjs-crud @concepta/nestjs-email @concepta/nestjs-event @concepta/nestjs-otp @concepta/nestjs-typeorm-ext @concepta/nestjs-user @concepta/typeorm-common`

At your `app.module.ts` you should configure OTP, USER, EMAIL modules with it's entities and services. Look at `packages/nestjs-invitation/src/__fixtures__/app.module.fixture.ts` for examples how to use it.

```typescript
EventModule.forRoot({}),
  ConfigModule.forRoot({
    isGlobal: true,
    load: [ormConfig],
  }),
  SwaggerUiModule.register({}),
  TypeOrmExtModule.registerAsync({
    inject: [ormConfig.KEY],
    useFactory: async (config: ConfigType<typeof ormConfig>) => config,
  }),
  CrudModule.forRoot({}),
  EmailModule.forRoot({
    mailerService: {
      sendMail(sendMailOptions): Promise<void> {
        Logger.debug('email sent', sendMailOptions);

        return Promise.resolve();
      },
    },
  }),
  InvitationModule.registerAsync({
    imports: [UserModule.deferred(), OtpModule.deferred()],
    inject: [UserLookupService, UserMutateService, OtpService, EmailService],
    useFactory: (
      userLookupService,
      userMutateService,
      otpService,
      emailService,
    ) => ({
      userLookupService,
      userMutateService,
      otpService,
      emailService,
    }),
    entities: {
      invitation: {
        entity: InvitationEntity,
      },
    },
  }),
  OtpModule.register({
    entities: {
      'user-otp': {
        entity: UserOtpEntity,
      },
    },
  }),
  UserModule.register({
    settings: {
      invitationRequestEvent: InvitationAcceptedEventAsync,
    },
    entities: {
      user: { entity: UserEntity },
    },
  })
```