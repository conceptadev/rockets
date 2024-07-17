# Rockets NestJS Access Control

Advanced access control guard for NestJS with optional per-request filtering.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-access-control)](https://www.npmjs.com/package/@concepta/nestjs-access-control)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-access-control)](https://www.npmjs.com/package/@concepta/nestjs-access-control)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

# Table of Contents

1. [Tutorials](#tutorials)
   - [Getting Started with Access Control](#getting-started-with-access-control)
     - [Installation](#installation)
   - [Basic Setup](#basic-setup)
   - [Example](#example)
     - [Simple User Entity](#simple-user-entity)
     - [Your custom ACL rules](#your-custom-acl-rules)
     - [Your custom AccessControlService](#your-custom-accesscontrolservice)
     - [Implement on your controller (Passport guard example)](#implement-on-your-controller-passport-guard-example)
     - [Import the module into your app](#import-the-module-into-your-app)
2. [How-To Guides](#how-to-guides)
   - [Creating a Custom Access Query Service](#creating-a-custom-access-query-service)
   - [Create a custom Access Control service](#create-a-custom-access-control-service)
   - [Disable AccessControlGuard](#disable-accesscontrolguard)
   - [Create a custom AccessControlGuard](#create-a-custom-accesscontrolguard)
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
3. [Reference](#reference)
4. [Explanation](#explanation)
   - [IMPORTANT](#important)
   - [What is Access Control?](#what-is-access-control)
   - [How AccessControlService Works](#how-accesscontrolservice-works)
     - [Key Responsibilities](#key-responsibilities)
   - [How Access Query Service Works](#how-access-query-service-works)
     - [Overview](#overview)
     - [Custom Logic in the Service](#custom-logic-in-the-service)
   - [How AccessControlGuard Works](#how-accesscontrolguard-works)
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

Define custom ACL rules using the `AccessControl` library. Here we are defining
a custom AccessControl to contains the rules of our authorization system. The
`acRules` will be used o grant specific permissions of a resource, to a defined role.
Please make sure to review a [Important](#important) section to understand important concepts of Access Control.

```typescript
// app.acl.ts
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

### Your custom AccessControlService

The access control service is not required in the settings, since we already
have a default `AccessControlService` in the module. However, let's create a
new one for the purposes of this tutorial. `AccessControlService` is responsible
for getting the user and its roles.

In the following example, we are assuming that our request as a user property
with the roles specified on it, the method `getUserRoles` will be used internally
on our default `AccessControlGuard` to check if the combination of the resource,
roles and permissions are valid.

The `ACService` is a provider, and you can be inject any other provider you may
need to get the correct user and its roles.

```typescript
import { AccessControlService } from 'nestjs-access-control';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.entity';

export class ACService implements AccessControlService {
  async getUser<T>(context: ExecutionContext): Promise<T> {
    const request = context.switchToHttp().getRequest();
    
    // request.user should be something like this
    // { id: '1', username: 'john', roles: [{ id: '1', name: 'User' }] }
    return request.user as T;
  }
  async getUserRoles(context: ExecutionContext): Promise<string | string[]> {
    const user = await this.getUser<User>(context);
    if (!user || !user.roles) throw new UnauthorizedException();
    return user.roles.map((role) => role.name);
  }
}
```

### Implement on your controller (Passport guard example)

The guard decorators, will be used to apply the specified actions for that endpoint.
for example:

```ts
 @AccessControlReadMany(AppResource.UserList)
  async getMany(@Query() query: unknown) {
    // ...
  }
```

For this code, we are applying the `AccessControlReadMany` decorator to the
`getMany` endpoint. This means that only users with a role that has been
granted the `read` permission for the `AppResource.UserList` resource can get the list of users.

For example, you need to grant the `read` permission to the `User` role for the `UserList` resource:

```ts
acRules.grant(AppRole.User).resource([AppResource.User]).readOwn();
// or
acRules.grant(AppRole.User).resource([AppResource.User]).readAny();
```

Check [Important](#important) section to understand the difference between `own` and `any`.

Let's create our controller.

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

### Import the module into your app

Import and register the `AccessControlModule` in your app module. settings.rules is the only property mandatory.

```typescript
//...
@Module({
  imports: [
    // ...
    AccessControlModule.forRoot({
      settings: { rules: acRules },
      service: new ACService(),
    }),
    // ...
  ],
  controllers: [UserController],
  providers: [],
})
export class AppModule {}
```

# How-To Guides

## Creating a Custom Access Query Service

AccessQueryService is a service that will be used to check if the user can access the resource.
any custom validation for a especific endpoint or a controller, should be done by creating a
custom query service. The query service created, should be added to `queryServices` settings on
module definition to make sure it will become a provider to be injected in any other service.
Once this is done, we can go ahead and add the query for any endpoint of controller with
`@AccessControlQuery` decorator.

To create a custom query service, follow these steps:

1. **Define the Service**: Create a new service class that implements `CanAccess` from
`@concepta/nestjs-access-control`. The `canAccess` method will provide you all information
you need to manage your access. On the following example, we check if a password update for
the User resource is being performed by the user that is trying to update itself.

```typescript
//...
export class MyUserAccessQueryService implements CanAccess {
  async canAccess(context: AccessControlContext): Promise<boolean> {
     const { resource, action } = context.getQuery();

    if (resource === AppResource.User && action === ActionEnum.UPDATE) {
      const userAuthorizedDto = plainToInstance(UserDto, context.getUser());

      const params = context.getRequest('params');
      const userParamDto = plainToInstance(UserDto, params);

      const body = context.getRequest('body');
      const userPasswordDto = plainToInstance(UserPasswordDto, body);

      if (userParamDto.id && userPasswordDto?.password) {
        return userParamDto.id === userAuthorizedDto.id;
      }
    }

    // does not apply
    return true;
  }
}
```

2. **Register the Service**: Register the custom service in your module.

```ts
//...
AccessControlModule.forRoot({
  settings: { rules: acRules },
  queryServices: [MyUserAccessQueryService],
}),
//...
```

3. **Set AccessControlQuery**: Set `AccessControlQuery` to controller

```ts
@Controller('user')
@ApiTags('user')
export class UserController {
  //...
  @AccessControlUpdateOne(AppResource.User)
  @AccessControlQuery({
    service: MyUserAccessQueryService,
  })
  async updateOne(
    @Param('id') userId: string,
    @Body() userUpdateDto: UserUpdateDto,
  ) {
    // ...
  }
  //...
}
```

## Create a custom Access Control service

TODO: maybe i should remove the access control service ffrom the tutorial and keep it here?
Please refer to the tutorial section at [Your custom AccessControlService](###-Your-custom-AccessControlService)

## Disable AccessControlGuard

You can disable all access control guards globally if needed. This can be useful for development or testing purposes. To disable the guards, set the appGuard option to false in the AccessControlModule configuration:

```ts
AccessControlModule.forRoot({
  settings: { rules: acRules },
  appGuard: false
}),
```

## Create a custom AccessControlGuard

This module contains a default `AccessControlGuard` that can be used to protect endpoints
with one of the many `@AccessControl` decorators. This guard will use the logic at
`AccessControlService` and `AccessQueryService` to check permissions. However, you
can create a custom guard if you need to. By creating a class that extends `CanActivate` from
`@nestjs/common`, you can create a custom guard that will be used to protect your endpoints.
Please keep in mind that the guard will be set globally for all endpoints.

```ts
@Injectable()
export class MyAccessControlGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // your custom logic here
    return true;
  }
}
```

```ts
AccessControlModule.forRoot({
      settings: { rules: acRules },
      appGuard: new MyAccessControlGuard()
    }),
```

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

# Reference

For more details, check the [official documentation](https://docs.nestjs.com/guards#access-control).

# Explanation

### IMPORTANT

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

### What is Access Control?

Access control in a software context refers to the selective restriction of access to resources. It ensures that only authorized users can access or modify data within an application.

### How AccessControlService Works

The `AccessControlService` is a crucial component in the access control system.
It is responsible for retrieving user information and their associated roles,
which are then used by the `AccessControlGuard` to enforce access control rules.
Here’s a detailed breakdown of its functionality:

#### Key Responsibilities

1. **User Retrieval**:
   - The `AccessControlService` provides a method to retrieve the current user
     from the execution context. This is typically done by extracting the user
     information from the request object.

2. **Role Retrieval**:
   - It also provides a method to retrieve the roles associated with the current
     user. This is essential for determining what actions the user is permitted
     to perform.

### How Access Query Service Works

The Query Services are services that should be used to define authorization logic for a specific endpoint or controller. we can either have a query service that runs for all endpoints, or we can create one for each endpoint or controller that we want to protect.

#### Overview

The `MyUserAccessQueryService` is designed to manage and control user access permissions within your application. The service should be added to `@AccessControlQuery` decorator to protect the route that handles the access of a single or multiple resource. Once the service is defined, the `AccessControlGuard` will use this logic internally to check if the user is authorized to access the resource.

#### Custom Logic in the Service

1. **canAccess Method**:
   - This method is used to determine if a user can access a particular resource.
   - You can add custom logic to check the user's role and the action they want to perform.
   - For example, you might allow users with a 'manager' role to read and update data, but restrict 'employee' roles to only read data.

2. **canUpdatePassword Method**:
   - This method is used to control whether a user can update their password.
   - You can add custom logic to ensure that users can only update their own passwords.
   - For example, you might check if the user is trying to update their own password and deny the request if they are trying to update someone else's password.

### How AccessControlGuard Works

The `AccessControlGuard` uses the methods provided by `AccessControlService` and `AccessQueryService` to enforce access control rules. Here’s how it works:

1. **Guard Initialization**:
   - When a request is made to a protected route, the `AccessControlGuard` is
     triggered.
   - The guard gets what permission was granted for what resource.

2. **Role Verification**:
   - The guard then calls the `getUserRoles` method to get the roles of the
     user.
   - Based on the roles, the guard checks if the user has the necessary
     permissions to access the requested resource.

3. **Access Queries Check**:
   - The guard then uses the access control queries defined to determine
     if the user is allowed to perform the requested action on the resource.
   - If the user has the required permissions, the request is allowed to
     proceed. Otherwise, it is denied.

### Practical Examples

- **Role-Based Access**:
  - Managers can view and edit all employee records.
  - Employees can only view their own records and cannot edit them.

- **Password Management**:
  - Users can change their own passwords but cannot change the passwords of other users.
  - Administrators might have the ability to reset passwords for any user.

### Benefits

- **Enhanced Security**: By implementing custom access control logic, you can ensure that sensitive data is only accessible to authorized users.
- **Flexibility**: The service allows you to define complex access rules that can be tailored to your application's specific needs.
- **Compliance**: Proper access control helps in meeting regulatory requirements by ensuring that only authorized users can access or modify data.

### Why Use Access Control?

Implementing access control ensures that your application maintains data integrity and security by allowing only authorized users to perform specific actions.

#### Synchronous vs Asynchronous Registration

- **Synchronous Registration**: Use when configuration options are static and available at startup.
- **Asynchronous Registration**: Use when configuration options need to be retrieved from external sources at runtime.

#### Global vs Feature-Specific Registration

- **Global Registration**: Makes the module available throughout the entire application.
- **Feature-Specific Registration**: Allows the module to be registered only for specific features or modules within the application.
