# Rockets NestJS Local Authentication

Authenticate requests using username/email and password against a local or 
remote data source.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-auth-local)](https://www.npmjs.com/package/@concepta/nestjs-auth-local)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-auth-local)](https://www.npmjs.com/package/@concepta/nestjs-auth-local)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Table of Contents

- [Project](#project)
- [Tutorials](#tutorials)
  - [1. Getting Started with AuthLocalModule](#1-getting-started-with-authlocalmodule)
    - [1.1 Introduction](#11-introduction)
      - [Overview of the Library](#overview-of-the-library)
      - [Purpose and Key Features](#purpose-and-key-features)
    - [1.2 Installation](#12-installation)
      - [Install the AuthLocalModule package](#install-the-authlocalmodule-package)
      - [Add the AuthLocalModule to Your NestJS Application](#add-the-authlocalmodule-to-your-nestjs-application)
    - [1.3 Basic Setup in a NestJS Project](#13-basic-setup-in-a-nestjs-project)
      - [Scenario: Users can log in using local authentication](#scenario-users-can-log-in-using-local-authentication)
        - [Step 1: Create Entities](#step-1-create-entities)
        - [Step 2: Create Services](#step-2-create-services)
        - [Step 3: Create Controller](#step-3-create-controller)
        - [Step 4: Configure the Module](#step-4-configure-the-module)
        - [Validating the Setup](#validating-the-setup)
- [How-To Guides](#how-to-guides)
  - [1. Registering AuthLocalModule Synchronously](#1-registering-authlocalmodule-synchronously)
  - [2. Registering AuthLocalModule Asynchronously](#2-registering-authlocalmodule-asynchronously)
  - [3. Global Registering AuthLocalModule Asynchronously](#3-global-registering-authlocalmodule-asynchronously)
  - [4. Using Custom User Lookup Service](#4-using-custom-user-lookup-service)
  - [5. Implementing and Using Custom Token Issuance Service](#5-implementing-and-using-custom-token-issuance-service)
  - [6. Implementing and Using Custom User Validation Service](#6-implementing-and-using-custom-user-validation-service)
  - [7. Implementing and Using Custom Password Validation Service](#7-implementing-and-using-custom-password-validation-service)
  - [8. Overwriting the Settings](#8-overwriting-the-settings)
  - [9. Integration with Other NestJS Modules](#9-integration-with-other-nestjs-modules)
- [Reference](#reference)
  - [1. AuthLocalOptionsInterface](#1-authlocaloptionsinterface)
  - [2. AuthLocalModule API Reference](#2-authlocalmodule-api-reference)
- [Explanation](#explanation)
  - [Conceptual Overview of Local Authentication](#conceptual-overview-of-local-authentication)
    - [What is Local Authentication?](#what-is-local-authentication)
    - [Benefits of Using Local Authentication](#benefits-of-using-local-authentication)
  - [Design Choices in AuthLocalModule](#design-choices-in-authlocalmodule)
    - [Why Use Local Authentication?](#why-use-local-authentication)
    - [Synchronous vs Asynchronous Registration](#synchronous-vs-asynchronous-registration)
    - [Global vs Feature-Specific Registration](#global-vs-feature-specific-registration)
    - [Integrating AuthLocalModule with Other Modules](#integrating-authlocalmodule-with-other-modules)
    
## Tutorials

### 1. Getting Started with AuthLocalModule

#### 1.1 Introduction

##### Overview of the Library

The `AuthLocalModule` is a robust NestJS module designed for implementing 
local authentication using username and password. This module leverages the 
`passport-local` strategy to authenticate users locally within your 
application.

##### Purpose and Key Features

- **Local Authentication**: Provides a straightforward way to implement local 
authentication using username and password.
- **Synchronous and Asynchronous Registration**: Flexibly register the module 
either synchronously or asynchronously, depending on your application's needs.
- **Global and Feature-Specific Registration**: Use the module globally across 
your application or tailor it for specific features.
- **Customizable**: Easily customize various aspects such as user validation, 
token issuance, and password validation.

#### 1.2 Installation

##### Install the AuthLocalModule package:
```sh
npm install class-transformer
npm install class-validator
npm install @concepta/ts-core
npm install @concepta/nestjs-authentication
npm install @concepta/nestjs-password
npm install @concepta/nestjs-jwt
npm install @concepta/nestjs-auth-local

or

yarn add class-transformer
yarn add class-validator
yarn add @concepta/ts-core
yarn add @concepta/nestjs-authentication
yarn add @concepta/nestjs-password
yarn add @concepta/nestjs-jwt
yarn add @concepta/nestjs-auth-local

```

##### Add the AuthLocalModule to Your NestJS Application:

Import the `AuthLocalModule` and required services in your application module. 
Ensure to provide the necessary configuration options at 
`AuthLocalOptionsInterface`.

The `AuthLocalOptionsInterface` defines the configuration options for the 
local authentication strategy within a NestJS application using the 
`nestjs-auth-local` package. This interface allows for the customization 
of `userLookupService`, `issueTokenService`, `validateUserService`, and 
`passwordValidationService`. Please see [Reference](#reference) for more 
details. 

optional fields utilize default implementations, enabling straightforward 
integration and flexibility to override with custom implementations as needed. 
This setup ensures that developers can tailor the authentication process to 
specific requirements while maintaining a robust and secure authentication 
framework.

#### 1.3 Basic Setup in a NestJS Project

##### Scenario: Users can log in using local authentication

To test this scenario, we will set up an application where users can log 
in using a username and password. We will create the necessary entities, services, module configurations.

## Step 1: Create Entities

First, create the `User` entity.

**Code:**
```ts
export class User {
  id: number;
  username: string;
  password: string;
}
```
## Step 2: Create Services

Next, you need to create the `UserLookupService`. This 
service is responsible for the business logic related to 
retrieving user data. It should implement the 
`AuthLocalUserLookupServiceInterface`. 

Within this service, implement the `byUsername` method to 
fetch user details by their email. Ensure that the method 
returns a `User` object containing `passwordHash` and 
`passwordSalt`. 

These attributes are crucial as they are used by the 
`validateUser` method in the `passwordValidationService` 
to authenticate the user, which is a configurable option 
in the `AuthLocalModule`.

**Code:**
```ts
import { Injectable } from '@nestjs/common';
import { ReferenceUsername } from '@concepta/ts-core';
import { AuthLocalUserLookupServiceInterface } from '@concepta/nestjs-auth-local';
import { AuthLocalCredentialsInterface } from '@concepta/nestjs-auth-local/dist/interfaces/auth-local-credentials.interface';

@Injectable()
export class UserLookupService implements AuthLocalUserLookupServiceInterface {
  async byUsername(
    username: ReferenceUsername,
  ): Promise<AuthLocalCredentialsInterface | null> {
    // make sure this method will return a valid user with
    // correct passwordHash and passwordSalt
    // let's user this mock data for the purposes of this tutorial
    return {
      id: '5b3f5fd3-9426-4c4d-a06d-b4d55079034d',
      username: username,
      passwordHash:
        '$2b$12$9rQ4qZx8gpTaTR4ic3LQ.OkebyVBa48DP42jErL1zfqF17WeG4hHC',
      passwordSalt: '$2b$12$9rQ4qZx8gpTaTR4ic3LQ.O',
      active: true,
    };
  }
}
```
## Step 3: Configure the Module

Configure the module to include the necessary services `userLookupService`.

**Code:**
```ts
import { Module } from '@nestjs/common';
import { AuthLocalModule } from '@concepta/nestjs-auth-local';
import { UserLookupService } from './user-lookup.service';
import { JwtModule } from '@concepta/nestjs-jwt';

@Module({
  imports: [
    JwtModule.forRoot({}),
    AuthLocalModule.forRoot({
      userLookupService: new UserLookupService(),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```
## Validating the Setup

To validate the setup, you can use `curl` commands to simulate frontend 
requests. Here are the 
steps to test the login endpoint:

## Step 1: Obtain a JWT Token

Assuming you have an endpoint to obtain a JWT token, use `curl` to get 
the token. Replace `auth-url` with your actual authentication URL, and 
`username` and `password` with valid credentials.
```sh
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpassword"}'
```
This should return a response with a login message.

## Example

Here is an example sequence of `curl` commands to validate the login setup:

1. **Login Request:**
```sh
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "username", "password": "Test1234"}'
```
Example response:
```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NjZkMTAyNS1iZGNkLTRiNWItYTYxMi0yYThiZTU2MDhlNjIiLCJpYXQiOjE3MTgwNDg1NDQsImV4cCI6MTcxODA1MjE0NH0.Zl2i59w89cgJxfI4lXn6VmOhC5GLEqMm2nWkiVKpEUs",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NjZkMTAyNS1iZGNkLTRiNWItYTYxMi0yYThiZTU2MDhlNjIiLCJpYXQiOjE3MTgwNDg1NDQsImV4cCI6NDg0MjI1MDk0NH0.xEF7kObwkztrMF7J83S-xvDarABmjXYkqLFINPWbx6g"
}
```

2. **Invalid Credentials Request:**
```sh
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "wrongpassword"}'
```
Example response:
```json
{
    "statusCode": 401,
    "message": "Unauthorized"
}
```
## How-To Guides

### 1. Registering AuthLocalModule Synchronously

**Code:**
```ts
//...
  AuthLocalModule.register({
    userLookupService: new MyUserLookupService(), // required
  }),
//...
```
### 2. Registering AuthLocalModule Asynchronously

**Code:**
```ts
//...
AuthLocalModule.forRootAsync({
  useFactory: async (userLookupService: MyUserLookupService) => ({
    userLookupService, // required
  }),
  inject: [MyUserLookupService],
}),
//...
```
### 3. Global Registering AuthLocalModule Asynchronously

**Code:**
```ts
//...
AuthLocalModule.forRootAsync({
  useFactory: async (userLookupService: MyUserLookupService) => ({
    userLookupService, 
  }),
  inject: [MyUserLookupService],
}),
//...
```
### 4. Using Custom User Lookup Service

**Code:**
```ts
import { AuthLocalUserLookupServiceInterface } from '@concepta/nestjs-auth-local';
import { AuthLocalCredentialsInterface } from '@concepta/nestjs-auth-local/dist/interfaces/auth-local-credentials.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyUserLookupService
  implements AuthLocalUserLookupServiceInterface {
  async byUsername(username: string): Promise<AuthLocalCredentialsInterface | null> {
    // implement custom logic to return the user's credentials
    return null;
  }
}
```
### 5. Implementing custom token issuance service
 
There are two ways to implementing the custom token issuer service. You can 
take advantage of the default service

```ts
import {
JwtIssueService,
JwtIssueServiceInterface,
JwtSignService,
} from '@concepta/nestjs-jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyJwtIssueService extends JwtIssueService {
  constructor(protected readonly jwtSignService: JwtSignService) {
    super(jwtSignService);
  }

  async accessToken(
    ...args: Parameters<JwtIssueServiceInterface['accessToken']>
  ) {
    // your custom code
    return this.accessToken(...args);
  }

  async refreshToken(
    ...args: Parameters<JwtIssueServiceInterface['refreshToken']>
  ) {
    // your custom code
    return this.refreshToken(...args);
  }
}
```

Or you can completely overwrite the default implementation.

**Code:**
```ts
import { JwtIssueServiceInterface } from '@concepta/nestjs-jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyJwtIssueService implements JwtIssueServiceInterface {
  constructor() {}

  async accessToken(
    ...args: Parameters<JwtIssueServiceInterface['accessToken']>
  ) {
    // your custom code
  }

  async refreshToken(
    ...args: Parameters<JwtIssueServiceInterface['refreshToken']>
  ) {
    // your custom code
  }
}
```
### 6. Implementing a custom user validation service

**Code:**

The same approach can be done for `AuthLocalValidateUserService` you can 
either completely overwrite the default implementation or you can take 
advantage of the default implementation.

```ts
@Injectable()
export class MyAuthLocalValidateUserService
  implements AuthLocalValidateUserServiceInterface
{

  async validateUser(
    dto: AuthLocalValidateUserInterface,
  ): Promise<ReferenceIdInterface> {
    return this.validateUser(dto);
  }

  async isActive(
    user: ReferenceIdInterface<string> & ReferenceActiveInterface<boolean>,
  ): Promise<boolean> {
    return true;
  }
}

```

```ts
import { AuthLocalValidateUserInterface, AuthLocalValidateUserServiceInterface } from "@concepta/nestjs-auth-local";
import { ReferenceActiveInterface, ReferenceIdInterface } from "@concepta/ts-core";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MyAuthLocalValidateUserService
  implements AuthLocalValidateUserServiceInterface
{

  async validateUser(
    dto: AuthLocalValidateUserInterface,
  ): Promise<ReferenceIdInterface> {
    return this.validateUser(dto);
  }

  async isActive(
    user: ReferenceIdInterface<string> & ReferenceActiveInterface<boolean>,
  ): Promise<boolean> {
    return this.isActive(user);
  }
}

```

### 7. Implementing a Custom Password Validation Service

The `PasswordValidationService` in the `nestjs-auth-local` module provides a 
default implementation using bcrypt for hashing and verifying passwords. 
However, depending on your application's requirements, you might need to use a 
different method for password hashing or add additional validation logic.

You can either extend the existing `PasswordValidationService` to leverage its 
built-in functionalities while adding your enhancements, or completely 
overwrite it with your custom implementation.


**Overwriting the Default Implementation:**

If your application requires a different hashing algorithm , you can replace 
the default implementation with one that suits your needs.

```ts
import {
  PasswordStorageInterface,
  PasswordValidationServiceInterface,
} from '@concepta/nestjs-password';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyPasswordValidationService
  implements PasswordValidationServiceInterface
{
  async validate(options: {
    password: string;
    passwordHash: string;
    passwordSalt: string;
  }): Promise<boolean> {
    return true;
  }

  async validateObject<T extends PasswordStorageInterface>(
    password: string,
    object: T,
  ): Promise<boolean> {
    return true;
  }
}
```
**Extending the Default Service:**

If you want to add additional validation logic while keeping the current 
hashing and validation, you can extend the default service:

```ts
import {
  PasswordStorageInterface,
  PasswordValidationService,
} from '@concepta/nestjs-password';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyPasswordValidationService extends PasswordValidationService {
  constructor() {
    super();
  }

  async validate(options: {
    password: string;
    passwordHash: string;
    passwordSalt: string;
  }): Promise<boolean> {
    return this.validate(options);
  }

  async validateObject<T extends PasswordStorageInterface>(
    password: string,
    object: T,
  ): Promise<boolean> {
    return this.validateObject(password, object);
  }
}
```

### 8. Overwriting the Settings

**Code:**
```ts
import { Type } from '@nestjs/common';

export class CustomLoginDto {
  email: string;
  password: string;
}

export const localSettings = {
  loginDto: CustomLoginDto,
  usernameField: 'email',
  passwordField: 'password'
};

```

```ts
AuthLocalModule.forRoot({
  userLookupService: new UserLookupService(),
  settings: localSettings
}),
```
### 9. Integration with Other NestJS Modules

Integrate `nestjs-auth-local` with other NestJS modules like, 
`nestjs-authentication`, `nestjs-auth-jwt`, `nestjs-auth-refresh` for
 a comprehensive authentication system.

## Reference

### Explanation of Properties in `AuthLocalOptionsInterface`

#### 1. **userLookupService** (required)
- **Purpose**: Essential for retrieving user details based on the username to 
initiate the authentication process.
- **Method**:
  - `byUsername(username: string): Promise<AuthLocalCredentialsInterface | null>`: 
  Queries user data storage to find a user by their username. Returns a user 
  object if found, or `null` if no user exists with that username.

#### 2. **issueTokenService** (optional)
- **Purpose**: Handles the generation of access and refresh tokens after user 
authentication.
- **Class**: `IssueTokenService`
  - `accessToken(...)`: Generates an access token using the `JwtIssueService`.
  - `refreshToken(...)`: Generates a refresh token using the `JwtIssueService`.

#### 3. **validateUserService** (optional)
- **Purpose**: Validates if a user can be authenticated with the provided 
credentials.
- **Class**: `AuthLocalValidateUserService`
  - `validateUser(dto: AuthLocalValidateUserInterface)`: Uses 
  `userLookupService` to fetch the user, checks user activity, and 
  validates the password using `passwordValidationService`.

#### 4. **passwordValidationService** (optional)
- **Purpose**: Validates the user's password against the stored hash 
to ensure the login attempt is legitimate.
- **Class**: `PasswordValidationService`
  - `validate(options: { password: string; passwordHash: string; passwordSalt: string; })`: 
  Compares the provided password with the stored hash and salt using 
  cryptographic functions.

  - `validateObject<T extends PasswordStorageInterface>(password: string, object: T)`: 
  Validates the password on an object that includes password hash 
  and salt.

#### 5. **settings** (optional)
- **Purpose**: Allows customization of the authentication process,
 specifying how the login data should be structured and which fields 
 are used for username and password.
- **Details**:
  - `loginDto`: Customizable data transfer object for login requests.
  - `usernameField` and `passwordField`: Specify the field names in the 
  `loginDto` that represent the username and password.

### 2. AuthLocalModule API Reference

- **register(options: AuthLocalOptions):**
  - Registers the module with synchronous options.

- **registerAsync(options: AuthLocalAsyncOptions):**
  - Registers the module with asynchronous options.

- **forRoot(options: AuthLocalOptions):**
  - Registers the module globally with synchronous options.

- **forRootAsync(options: AuthLocalAsyncOptions):**
  - Registers the module globally with asynchronous options.

## Explanation

### Conceptual Overview of Local Authentication

#### What is Local Authentication?

Local Authentication is a method of verifying user identity based on credentials
(username and password) stored locally within the application or in a connected
database.

#### Benefits of Using Local Authentication

- **Simplicity**: Easy to implement and manage.
- **Control**: Full control over user authentication and data.
- **Security**: When properly implemented, provides a secure way to authenticate
 users.

### Design Choices in AuthLocalModule

#### Why Use Local Authentication?

Local Authentication is ideal for applications that need to manage user 
authentication directly within the application without relying on external 
identity providers.

#### Synchronous vs Asynchronous Registration

- **Synchronous Registration**: Used when configuration options are static and 
available at startup.
- **Asynchronous Registration**: Used when configuration options need to be 
retrieved from external sources at runtime.

#### Global vs Feature-Specific Registration

- **Global Registration**: Makes the module available throughout the entire 
application.
- **Feature-Specific Registration**: Allows the module to be registered only 
for specific features or modules within the application.

