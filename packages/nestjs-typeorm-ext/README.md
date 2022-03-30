[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-typeorm-ext)](https://www.npmjs.com/package/@concepta/nestjs-typeorm-ext)
[![NPM Alpha](https://img.shields.io/npm/v/@concepta/nestjs-typeorm-ext/alpha)](https://www.npmjs.com/package/@concepta/nestjs-nestjscontrol)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-typeorm-ext)](https://www.npmjs.com/package/@concepta/nestjs-typeorm-ext)

[![GitHub Open Issues](https://img.shields.io/github/issues/conceptadev/rockets/nestjs-typeorm-ext)](https://github.com/conceptadev/rockets/labels/nestjs-typeorm-ext)
[![GitHub Closed Issues](https://img.shields.io/github/issues-closed/conceptadev/rockets/nestjs-typeorm-ext)](https://github.com/conceptadev/rockets/labels/nestjs-typeorm-ext)
[![GitHub Open PRs](https://img.shields.io/github/issues-pr/conceptadev/rockets/nestjs-typeorm-ext)](https://github.com/conceptadev/rockets/labels/nestjs-typeorm-ext)
[![GitHub Closed PRs](https://img.shields.io/github/issues-pr-closed/conceptadev/rockets/nestjs-typeorm-ext)](https://github.com/conceptadev/rockets/labels/nestjs-typeorm-ext)

# Rockets NestJS TypeOrm Extended

Extremely powerful extension of the NestJS TypeOrm module that allows your
dynamic modules to accept drop-in replacements of custom entities
and repositories at registration time.

## Overview

The TypeOrm Ext module provides a powerful wrapper around the
[@nestjs/typeorm](https://www.npmjs.com/package/@nestjs/typeorm) module.

While still using the identical configuration options of the TypeOrm module,
you can increase the extensibility of your custom module by designing it
to accept custom entity and repository overrides.

This pattern allows you to publish modules that are loosely coupled to their
own entity and repository definitions. This enables implementations of your
module to define their own concrete data storage.

## Installation

`yarn add @concepta/nestjs-typeorm-ext`

## Module Design

Designing your module to use this extension is fairly straight forward, but a bit too verbose
for this readme.

To see how this was implemented in our
[UserModule](https://github.com/conceptadev/rockets/blob/main/packages/nestjs-user)
please refer to that module's
[user.module.ts](https://github.com/conceptadev/rockets/blob/main/packages/nestjs-user/src/user.module.ts)

## Usage

app.module.ts

```ts
// ...
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { UserModule } from '@concepta/nestjs-user';
import { CustomUserRepository } from 'path/to/custom-user.repository';
import { CustomUser } from 'path/to/custom-user.entity';

@Module({
  imports: [
    TypeOrmExtModule.register({
      type: 'postgres',
      url: 'postgres://user:pass@localhost:5432/postgres',
    }),
    UserModule.register({
      orm: {
        entities: {
          user: { useClass: CustomUser },
        },
        repositories: {
          userRepository: { useClass: CustomUserRepository },
        },
      },
    }),
  ],
})
export class AppModule {}
```

## Configuration

### Connection Options

The module options are identical the the NestJS TypeOrm module.

### Test Mode

> Currently test mode is only known to work for `postgres`.

If you register the module using `registerAsync()` you can pass the `testMode: true` option.
This magically replaces the connection with a fake connection factory that overrides
the database driver and query runner to mock a database connection and effectively
"do nothing" whenever the query runner is called.

Test mode disables all queries, so you cannot test results, but you can test that methods
are being called with the expected arguments without TypeOrm complaining about no connection.
