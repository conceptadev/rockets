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

Installation
To install the module, use the following command:

## Installation

`yarn add @concepta/nestjs-cache`

## Configuration

The Cache Module allows for detailed configuration to link your application's data models with caching mechanisms.

### Configuration Options Explained

- **settings**: Manages how entities are assigned for caching.
- **entities**: Specifies which entities are to be cached.

## Usage

To utilize the caching module, you need to define the entities and configure the module appropriately.

## Example
Define your UserEntityFixture and UserCacheEntityFixture entities as follows:

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
## Setup

### Define Entities
Ensure that you have defined the entities in your project that you wish to cache. For instance, a UserEntityFixture might be used for storing user information.

### Configure the Cache Module
Incorporate the Cache Module into your application module and configure it for your specific needs:

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

### Client-side Interaction with CRUD Endpoints

The Cache API provides RESTful endpoints for managing cached data. The endpoint path follows the format `cache/:assignment`, where `:assignment` is defined in your module configuration. For example, if you have the configuration:

```typescript
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
})
```
The endpoint will be cache/user. Below are examples of how to interact with the API using curl.

### Create (POST)
To create a new cache entry, the request body should match the CacheCreatableInterface:

```ts
export interface CacheCreatableInterface extends Pick<CacheInterface, 'key' | 'type' | 'data' | 'assignee'> {
    expiresIn: string | null;
}
```
Example curl command:

```sh
curl -X POST http://your-api-url/cache/user \
-H "Content-Type: application/json" \
-d '{
  "key": "exampleKey",
  "type": "exampleType",
  "data": "{data: 'example'}",
  "assignee": { id: 'exampleId'},
  "expiresIn": "1h"
}'

```
### Read (GET)
To read a cache entry by its ID:

```sh
curl -X GET http://your-api-url/cache/user/{id}
```

### Update (PUT)
To update an existing cache entry, the request body should match the CacheUpdatableInterface:

```ts
export interface CacheUpdatableInterface extends Pick<CacheInterface, 'key' | 'type' | 'data' | 'assignee'> {
    expiresIn: string | null;
}

```
Example curl command:

```sh
curl -X PUT http://your-api-url/cache/user/{id} \
-H "Content-Type: application/json" \
-d '{
  "key": "updatedKey",
  "type": "updatedType",
  "data": "updatedData",
  "assignee": "updatedAssignee",
  "expiresIn": "2d"
}'

```
### Delete (DELETE)
To delete a cache entry by its ID:

```sh
curl -X DELETE http://your-api-url/cache/user/{id}
```

Replace http://your-api-url with the actual base URL of your API, and {id} with the actual ID of the cache entry you wish to interact with.

By following these examples, you can perform Create, Read, Update, and Delete operations on your cache data using the provided endpoints.

## How the Module Works

### Overview

The Rockets NestJS Cache module is designed to provide an easy and efficient way to manage cached data in your application. Here's a simple explanation of how it works:

### Dynamic Controller Generation

The module automatically creates controllers based on the settings you provide. This means you can set up different cache entities and their endpoints without writing extra code. The endpoints are created based on the assignments you define in the module configuration.

### CRUD Operations

The module supports all basic operations: Create, Read, Update, and Delete (CRUD). These operations are managed by a controller that uses special decorators to define and control access. The operations are routed based on the cache assignment specified in the request.

### Service Injection

The module uses a technique called dependency injection to manage its settings and services. It injects configuration settings that define cache assignments and expiration times, as well as a list of CRUD services. This allows the module to dynamically choose the right service for each cache assignment.

### Handling Assignments

In the module configuration, you specify different cache assignments. Each assignment is linked to a specific entity and CRUD service. When a request is made to the cache endpoint, the module uses the assignment in the request to determine which entity and service to use.

### Exception Handling

The module has built-in error handling to manage invalid assignments or entity keys. It throws specific errors when something goes wrong, ensuring that your application can handle these issues gracefully and provide clear error messages to the client.

### Summary

The Rockets NestJS Cache module provides a powerful and flexible way to manage cached data. By automatically generating controllers, using dependency injection, and handling various types of cached data dynamically, it ensures your application can run efficiently without redundant database queries.


#### ENV

Configurations available via environment.

| Variable                   | Type       | Default |                                      |
| -------------------------- | ---------- | ------- | ------------------------------------ |
| `CACHE_MODULE_SEEDER_AMOUNT` | `<number>` | `50`    | number of additional users to create |
| `CACHE_EXPIRE_IN` | `<string>` | `1d`    | string for the amount of time to expire the cache |
