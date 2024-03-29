# Rockets NestJS Access Control

Advanced access control guard for NestJS with optional per-request filtering.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-access-control)](https://www.npmjs.com/package/@concepta/nestjs-access-control)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-access-control)](https://www.npmjs.com/package/@concepta/nestjs-access-control)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Installation

`yarn add @concepta/nestjs-access-control`

## IMPORTANT

When building your ACL, you need to remember these!

> This module only helps you apply a pattern. There is no magic, you are ultimately responsible for
> checking that your ACL works in all contexts.

Here is the pattern:

- Giving `any` access implies that the role IS NOT restricted by ownership, or other rules, to that action/resource combination.
- Giving `own` access implies that the role IS restricted by ownership to that action/resource combination
  (it is often required to enforce this rule with a filter to check the data layer when not all information required to
  check ownership exists in the parameters or query string.)

!!! Important !!!

> All roles that are given `any` access to a resource will NOT be passed through access filters since `any` implies they should have all access.

## Example

These are very rough examples. We intend to improve them ASAP.

### Simple User Entity

```typescript
import { Entity, Column, ManyToMany, Unique } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../auth/role.entity';

@Entity()
@Unique(['username'])
export class User {
  @Column()
  username!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column()
  @Exclude()
  salt!: string;

  @ManyToMany(() => Role, (role) => role.users, {
    eager: true,
    onDelete: 'CASCADE',
  })
  roles!: Role[];
}
```

### Your custom AccessControlService

```typescript
import { AccessControlService } from 'nestjs-access-control';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.entity';

export class ACService implements AccessControlService {
  async getUser<T>(context: ExecutionContext): Promise<T> {
    const request = context.switchToHttp().getRequest();
    return request.user as T;
  }
  async getUserRoles(context: ExecutionContext): Promise<string | string[]> {
    const user = await this.getUser<User>(context);
    if (!user || !user.roles) throw new UnauthorizedException();
    return user.roles.map((role) => role.name);
  }
}
```

### Your custom ACL rules

```typescript
import { AccessControl } from 'accesscontrol';

export enum AppRole {
  SuperAdmin = 'SuperAdmin',
  User = 'User',
}

export enum AppResource {
  User = 'user',
  UserList = 'user-list',
}

const allResources = Object.values(AppResource);
const allRoles = Object.values(AppRole);

export const acRules: AccessControl = new AccessControl();

// admins can do whatever they want
acRules
  .grant([AppRole.SuperAdmin])
  .resource(allResources)
  .createOwn()
  .createAny()
  .readOwn()
  .readAny()
  .updateOwn()
  .updateAny()
  .deleteOwn()
  .deleteAny();

// regular users can read self
acRules.grant(AppRole.User).resource([AppResource.User]).readOwn();

// make sure nobody can delete themselves
acRules.deny(allRoles).resource(AppResource.User).deleteOwn();
```

### Import the module into your app

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccessControlModule } from 'nestjs-access-control';
import { ACService } from './modules/auth/access-control.service';
import { acRules } from './app.acl';

@Module({
  imports: [
    // ...
    AccessControlModule.register({ service: ACService, rules: acRules }),
    // ...
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Implement on your controller (Passport guard example)

```typescript
import { ApiTags } from '@nestjs/swagger';
import { Controller, Body, Query, Param } from '@nestjs/common';
import {
  AccessControlCreateMany,
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
  AccessControlRecoverOne,
  AccessControlUpdateOne,
} from '@concepta/nestjs-access-control';

import { UserResource } from './user.types';
import { UserCreateDto } from './dto/user-create.dto';
import { UserCreateManyDto } from './dto/user-create-many.dto';
import { UserUpdateDto } from './dto/user-update.dto';

/**
 * User controller.
 */
@Controller('user')
@ApiTags('user')
export class UserController {
  /**
   * Get many
   */
  @AccessControlReadMany(UserResource.Many)
  async getMany(@Query() query: unknown) {
    // ...
  }

  /**
   * Get one
   */
  @AccessControlReadOne(UserResource.One)
  async getOne(@Param('id') id: string) {
    // ...
  }

  /**
   * Create many
   */
  @AccessControlCreateMany(UserResource.Many)
  async createMany(@Body() userCreateManyDto: UserCreateManyDto) {
    // ...
  }

  /**
   * Create one
   */
  @AccessControlCreateOne(UserResource.One)
  async createOne(@Body() userCreateDto: UserCreateDto) {
    // ...
  }

  /**
   * Update one
   */
  @AccessControlUpdateOne(UserResource.One)
  async updateOne(
    @Param('id') userId: string,
    @Body() userUpdateDto: UserUpdateDto,
  ) {
    // ...
  }

  /**
   * Delete one
   */
  @AccessControlDeleteOne(UserResource.One)
  async deleteOne(@Param('id') id: string) {
    // ...
  }

  /**
   * Recover one
   */
  @AccessControlRecoverOne(UserResource.One)
  async recoverOne(@Param('id') id: string) {
    // ...
  }
}
```
