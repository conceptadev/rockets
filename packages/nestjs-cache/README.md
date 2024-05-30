# Rockets NestJS Cache

A module for managing a basic Cache entity, including controller with full CRUD, DTOs, sample data factory and seeder.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-user)](https://www.npmjs.com/package/@concepta/nestjs-user)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-user)](https://www.npmjs.com/package/@concepta/nestjs-user)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration Details](#configuration-details)
- [Setup](#setup)
- [Configuration Options Explained](#configuration-options-explained)

## Introduction

This module is a basic implementation of a caching mechanism for your application. It allows you to cache data in a database and retrieve it later, ensuring that your application is not repeatedly fetching the same data from a database.

How does it work? Let's create the entities we will need to cache the information of a User Entity




## Usage

Inf 

```ts
@Entity()
export class UserEntityFixture implements ReferenceIdInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: false })
  isActive!: boolean;

  @OneToMany(() => UserCacheEntityFixture, (userCache) => userCache.assignee)
  userCaches!: UserCacheEntityFixture[];
}

```
 
```typescript
@Entity()
export class UserCacheEntityFixture extends CacheSqliteEntity {
  @ManyToOne(() => UserEntityFixture, (user) => user.userCaches)
  assignee!: ReferenceIdInterface;
}
```

```ts
// ...

@Module({
  imports: [
    TypeOrmExtModule.forRoot({
      type: 'postgres',
      url: 'postgres://user:pass@localhost:5432/postgres',
    }),
    CacheModule.register({
      settings: {
        assignments: {
          user: { entityKey: 'userCache' },
        },
      },
      entities: {
        userCache: {
          entity: UserCacheEntityFixture,
        },
      },
    }),
    CacheModule.forRoot({}),
  ],
})
export class AppModule {}
```

## Installation

`yarn add @concepta/nestjs-cache`

## Configuration Details

The Cache Module allows for detailed configuration to link your application's data models with caching mechanisms. Here’s a breakdown of the main configuration options:

- **settings**: Manages how entities are assigned for caching.
- **entities**: Specifies which entities are to be cached.

## Setup

### Step 1: Define Entities

Ensure that you have defined the entities in your project that you wish to cache. For instance, a `UserEntity` might be used for storing user information.

### Step 2: Configure the Cache Module

Incorporate the Cache Module into your application module and configure it for your specific needs:

## Configuration Options Explained:

### entities:

- **userCache**: The key that corresponds to the caching entity.
- **entity**: The actual entity class (`UserCacheEntity` in this case) used for caching operations.

### settings.assignments:

- **user**: A logical name used within your application to refer to user data, this will be in the route to access the endpoint.
- **entityKey**: Specifies the key under which the entity's data is cached. Here, 'userCache' is linked to the `UserCacheEntity`.


### Seeding

Configurations specific to (optional) database seeding.

#### ENV

Configurations available via environment.

| Variable                   | Type       | Default |                                      |
| -------------------------- | ---------- | ------- | ------------------------------------ |
| `CACHE_MODULE_SEEDER_AMOUNT` | `<number>` | `50`    | number of additional users to create |
| `CACHE_EXPIRE_IN` | `<string>` | `1d`    | string for the amount of time to expire the cache |
