# Rockets NestJS Access Control

Advanced access control guard for NestJS with optional per-request filtering.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-access-control)](https://www.npmjs.com/package/@concepta/nestjs-access-control)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-access-control)](https://www.npmjs.com/package/@concepta/nestjs-access-control)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

# Table of Contents

3. [Tutorials](#tutorials)
   - [Getting Started with Access Control](#getting-started-with-access-control)
     - [Installation](#installation)
   - [Basic Setup](#basic-setup)
   - [Example](#example)
     - [Simple User Entity](#simple-user-entity)
     - [Your custom ACL rules](#your-custom-acl-rules)
     - [Create the Access Query service](#create-the-access-query-service)
     - [Import the module into your app](#import-the-module-into-your-app)
     - [Implement on your controller (Passport guard example)](#implement-on-your-controller-passport-guard-example)
4. [How-To Guides](#how-to-guides)
   - [Using `@AccessControlCreateOne` Decorator](#using-accesscontrolcreateone-decorator)
     - [Description](#description)
     - [Setting Permissions](#setting-permissions)
     - [Using in a Controller](#using-in-a-controller)
   - [Using `@AccessControlUpdateOne` Decorator](#using-accesscontrolupdateone-decorator)
     - [Description](#description-1)
     - [Setting Permissions](#setting-permissions-1)
     - [Using in a Controller](#using-in-a-controller-1)
   - [Using `@AccessControlReadOne` Decorator](#using-accesscontrolreadone-decorator)
     - [Description](#description-2)
     - [Setting Permissions](#setting-permissions-2)
     - [Using in a Controller](#using-in-a-controller-2)
     - [Using in a Controller to get own information only](#using-in-a-controller-to-get-own-information-only)
   - [Using `@AccessControlDeleteOne` Decorator](#using-accesscontroldeleteone-decorator)
     - [Description](#description-3)
     - [Setting Permissions](#setting-permissions-3)
     - [Using in a Controller](#using-in-a-controller-3)
   - [Using `@AccessControlCreateMany` Decorator](#using-accesscontrolcreatemany-decorator)
     - [Description](#description-4)
     - [Setting Permissions](#setting-permissions-4)
     - [Using in a Controller](#using-in-a-controller-4)
   - [Using `@AccessControlReadMany` Decorator](#using-accesscontrolreadmany-decorator)
     - [Description](#description-5)
     - [Setting Permissions](#setting-permissions-5)
     - [Using in a Controller](#using-in-a-controller-5)
   - [Creating a Custom Service](#creating-a-custom-service)
5. [Reference](#reference)
6. [Explanation](#explanation)
   - [IMPORTANT](#important)
   - [Conceptual Overview of Access Control](#conceptual-overview-of-access-control)
     - [What is Access Control?](#what-is-access-control)
     - [Benefits of Using Access Control](#benefits-of-using-access-control)
   - [Design Choices in Access Control](#design-choices-in-access-control)
     - [How Custom Access Query Service Works](#how-custom-access-query-service-works)
       - [Overview](#overview)
       - [What Users Can Do](#what-users-can-do)
       - [Custom Logic in the Service](#custom-logic-in-the-service)
       - [Practical Examples](#practical-examples)
       - [Benefits](#benefits)
     - [Why Use Access Control?](#why-use-access-control)
     - [Synchronous vs Asynchronous Registration](#synchronous-vs-asynchronous-registration)
     - [Global vs Feature-Specific Registration](#global-vs-feature-specific-registration)

# Tutorials

## Getting Started with Access Control

### Installation

Install the `@concepta/nestjs-access-control` package using yarn or npm:

```sh
yarn add @concepta/nestjs-access-control
```

```sh
npm install @concepta/nestjs-access-control
```

## Basic Setup

To set up the `@concepta/nestjs-access-control` module, you need to define your access control rules, create a custom access query service, and import the `AccessControlModule` into your app module. This ensures that your application can enforce access control policies based on the defined rules and services.

## Example

These are very rough examples. We intend to improve them ASAP.

### Simple User Entity

Define a simple User entity using TypeORM and class-transformer.

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

### Your custom ACL rules

Define custom ACL rules using the `AccessControl` library.

```typescript
import { AccessControl } from 'accesscontrol';

/**
 * All the possible roles of the system.
 */
export enum AppRole {
  SuperAdmin = 'SuperAdmin',
  User = 'User',
}

/**
 * All the possible resources of the system.
 */
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

### create the Access Query service

```ts
import { plainToInstance } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import {
  CanAccess,
  AccessControlContext,
  ActionEnum,
} from '@concepta/nestjs-access-control';
import { UserDto } from '../dto/user.dto';
import { UserPasswordDto } from '../dto/user-password.dto';
import { UserResource } from '../user.types';

@Injectable()
export class UserAccessQueryService implements CanAccess {
  async canAccess(context: AccessControlContext): Promise<boolean> {
    return this.canUpdatePassword(context);
  }

  protected async canUpdatePassword(
    context: AccessControlContext,
  ): Promise<boolean> {
    const { resource, action } = context.getQuery();

    // can only update its own password
    if (resource === UserResource.One && action === ActionEnum.UPDATE) {
        return true;
    }

    // does not apply
    return true;
  }
}

```

### Import the module into your app

Import and register the `AccessControlModule` in your app module.

```typescript
//...
@Module({
  imports: [
    // ...
    AccessControlModule.forRoot({
      settings: { rules: acRules },
      queryServices: [UserAccessQueryService],
    }),
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
  @AccessControlReadMany(AppResource.UserList)
  async getMany(@Query() query: unknown) {
    // ...
  }

  /**
   * Get one
   */
  @AccessControlReadOne(AppResource.User)
  async getOne(@Param('id') id: string) {
    // ...
  }

  /**
   * Create many
   */
  @AccessControlCreateMany(AppResource.UserList)
  async createMany(@Body() userCreateManyDto: UserCreateManyDto) {
    // ...
  }

  /**
   * Create one
   */
  @AccessControlCreateOne(AppResource.User)
  async createOne(@Body() userCreateDto: UserCreateDto) {
    // ...
  }

  /**
   * Update one
   */
  @AccessControlUpdateOne(AppResource.User)
  async updateOne(
    @Param('id') userId: string,
    @Body() userUpdateDto: UserUpdateDto,
  ) {
    // ...
  }

  /**
   * Delete one
   */
  @AccessControlDeleteOne(AppResource.User)
  async deleteOne(@Param('id') id: string) {
    // ...
  }

  /**
   * Recover one
   */
  @AccessControlRecoverOne(AppResource.User)
  async recoverOne(@Param('id') id: string) {
    // ...
  }
}
```

# How-To Guides

## Using `@AccessControlCreateOne` Decorator

### Description

The `@AccessControlCreateOne` decorator is used to grant create permissions for a single resource. This decorator is a shortcut for defining access control grants for creating one resource.

### Setting Permissions

First, define your access control rules using the AccessControl library. This example shows how to set permissions for different roles.

```ts
//...
ac.grant(AppRole.User)
  .createOwn(AppResource.User);
//...
```

### Using in a Controller

Next, use the `@AccessControlCreateOne` decorator in your controller to protect the route that handles the creation of a single resource.

```ts
  @Post()
  @AccessControlCreateOne(AppResource.User)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
```

## Using `@AccessControlUpdateOne` Decorator

### Description

The `@AccessControlUpdateOne` decorator is used to grant update permissions for a single resource. This decorator is a shortcut for defining access control grants for updating one resource.

### Setting Permissions

First, define your access control rules using the `AccessControl` library. This example shows how to set permissions for different roles.

```ts

ac.grant(AppRole.User)
  .updateOwn(AppResource.User)
//...
```

#### Using in a Controller

Next, use the `@AccessControlUpdateOne` decorator in your controller to protect the route that handles the updating of a single resource.

```ts
  @Put(':id')
  @AccessControlUpdateOne(AppResource.User)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
```

## Using `@AccessControlReadOne` Decorator

### Description

The `@AccessControlReadOne` decorator grants read permissions for a single resource. It is a shortcut for defining access control grants for reading one resource.

### Setting Permissions

First, define your access control rules using the `AccessControl` library. This example shows how to set permissions for different roles. Please refer [Important Notes Section](#important) for better understanding of the permissions.

```ts
//...
// User can only read their own information
ac.grant(AppRole.User)
  .readOwn(AppResource.User)

// Admin can read any information of resource User (however you still need to specify this authorization on AccessControlReadOne)
ac.grant(AppRole.Admin)
  .readAny(AppResource.User)
// ...
```

### Using in a Controller

Next, use the `@AccessControlReadOne` decorator in your controller to protect the route that handles the reading of a single resource.

```ts
//...
  @Get(':id')
  @AccessControlReadOne(AppResource.User)
  getOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
//...
```

### Using in a Controller to get own information only

User that contains Role `User` can only get their own information.
User that contains Role `Admin` can get any information of resource `User`.

```ts
//...
  @Get(':id')
  @AccessControlReadOne(AppResource.User)
  getOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
//...
```

## Using `@AccessControlDeleteOne` Decorator

### Description

The `@AccessControlDeleteOne` decorator is used to grant delete permissions for a single resource. This decorator is a shortcut for defining access control grants for deleting one resource.

### Setting Permissions

First, define your access control rules using the `AccessControl` library. This example shows how to set permissions for different roles.

```ts
//...
ac.grant(AppRole.User)
  .deleteOwn(AppResource.User);
//...
```

#### Using in a Controller

Next, use the `@AccessControlDeleteOne` decorator in your controller to protect the route that handles the deletion of a single resource.

```ts
//...
  @Delete(':id')
  @AccessControlDeleteOne(AppResource.User)
  deleteOne(@Param('id') id: string) {
    return this.userService.delete(id);
  }
//...
```

## Using `@AccessControlCreateMany` Decorator

### Description

The `@AccessControlCreateMany` decorator is used to grant create permissions for multiple resources. This decorator is a shortcut for defining access control grants for creating many resources.

### Setting Permissions

First, define your access control rules using the `AccessControl` library. This example shows how to set permissions for different roles.

```ts
//...
ac.grant(AppRole.User)
  .createAny(AppResource.User);
//...
```

### Using in a Controller

Next, use the `@AccessControlCreateMany` decorator in your controller to protect the route that handles the creation of multiple resources.

```ts
//...
  @Post('bulk')
  @AccessControlCreateMany(AppResource.User)
  createMany(@Body() createUsersDto: CreateUsersDto) {
    return this.userService.createMany(createUsersDto);
  }
//...
```

## Using `@AccessControlReadMany` Decorator

### Description

The `@AccessControlReadMany` decorator is used to grant read permissions for multiple resources. This decorator is a shortcut for defining access control grants for reading multiple resources.

### Setting Permissions

First, define your access control rules using the `AccessControl` library. This example shows how to set permissions for different roles.

```ts
//...
ac.grant(AppRole.User)
  .readAny(AppResource.Article)
// ...
```

### Using in a Controller

Next, use the `@AccessControlReadMany` decorator in your controller to protect the route that handles the reading of multiple resources.

```ts
//...
  @Get(':id')
  @AccessControlReadMany(AppResource.Article)
  getMany() {
    return this.articleService.getMany();
  }
//...
```

## Creating a Custom Service

To create a custom service, follow these steps:

1. **Define the Service**: Create a new service class that implements the required methods. you can take advantage of the service `UserAccessQueryService` from `@concepta/nestjs-user` to create a custom UserAccessQueryService pls reference [`@concepta/nestjs-user`](https://www.npmjs.com/package/@concepta/nestjs-user) for more details. The `canAccess` method will provide you all information you need to manage your access.

```typescript
//...
export class YourUserAccessQueryService extends UserAccessQueryService {
  constructor() {
    super();
  }

  async canAccess(context: AccessControlContext): Promise<boolean> {
    const { action, role } = context.getQuery();
    //  action === 'read' || action === 'update'
    // context.getUser() to get authenticated user
    // your custom logic here
    return super.canAccess(context);
  }

  async canUpdatePassword(context: AccessControlContext): Promise<boolean> {
    const { possession } = context.getQuery();
    // your custom logic here
    if (possession === PossessionEnum.OWN) {
      return super.canUpdatePassword(context);
    } else return true;
  }
}
```

2. **Register the Service**: Register the custom service in your module.

```ts
//...
AccessControlModule.forRoot({
      settings: { rules: acRules },
      queryServices: [YourUserAccessQueryService],
    }),
//...
```

# Reference

For more details, check the [official documentation](https://docs.nestjs.com/guards#access-control).

# Explanation

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

### Conceptual Overview of Access Control

#### What is Access Control?

Access control in a software context refers to the selective restriction of access to resources. It ensures that only authorized users can access or modify data within an application.

#### Benefits of Using Access Control

- **Security**: Restrict access to sensitive data and operations to authorized users only.
- **Flexibility**: Define granular access control rules to suit various application requirements.
- **Compliance**: Meet regulatory requirements by ensuring proper access controls are in place.

### Design Choices in Access Control

## How Custom Access Query Service Works

### Overview

The `YourUserAccessQueryService` is designed to manage and control user access to various resources within your application. By extending the base `UserAccessQueryService`, it allows you to implement custom rules and logic to ensure that only authorized users can perform specific actions.

### What Users Can Do

1. **Access Resources**:
   - Users can access different resources based on their roles and the actions they are trying to perform (e.g., reading or updating data).
   - The service checks the user's role and the action they want to perform to determine if access should be granted.

2. **Update Passwords**:
   - Users can update their own passwords.
   - The service ensures that users can only update their own passwords and not those of other users.

### Custom Logic in the Service

1. **canAccess Method**:
   - This method is used to determine if a user can access a particular resource.
   - You can add custom logic to check the user's role and the action they want to perform.
   - For example, you might allow users with a 'manager' role to read and update data, but restrict 'employee' roles to only read data.

2. **canUpdatePassword Method**:
   - This method is used to control whether a user can update their password.
   - You can add custom logic to ensure that users can only update their own passwords.
   - For example, you might check if the user is trying to update their own password and deny the request if they are trying to update someone else's password.

### Practical Examples

- **Role-Based Access**:
  - Managers can view and edit all employee records.
  - Employees can only view their own records and cannot edit them.

- **Password Management**:
  - Users can change their own passwords but cannot change the passwords of other users.
  - Administrators might have the ability to reset passwords for any user.

## Benefits

- **Enhanced Security**: By implementing custom access control logic, you can ensure that sensitive data is only accessible to authorized users.
- **Flexibility**: The service allows you to define complex access rules that can be tailored to your application's specific needs.
- **Compliance**: Proper access control helps in meeting regulatory requirements by ensuring that only authorized users can access or modify data.

By using the `YourUserAccessQueryService`, you can create a robust and flexible access control system that enhances the security and integrity of your application.

#### Why Use Access Control?

Implementing access control ensures that your application maintains data integrity and security by allowing only authorized users to perform specific actions.

#### Synchronous vs Asynchronous Registration

- **Synchronous Registration**: Use when configuration options are static and available at startup.
- **Asynchronous Registration**: Use when configuration options need to be retrieved from external sources at runtime.

#### Global vs Feature-Specific Registration

- **Global Registration**: Makes the module available throughout the entire application.
- **Feature-Specific Registration**: Allows the module to be registered only for specific features or modules within the application.
