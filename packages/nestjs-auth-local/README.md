# Rockets NestJS Local Authentication

Authenticate requests using username/email and password against a local or remote data source.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-auth-local)](https://www.npmjs.com/package/@concepta/nestjs-auth-local)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-auth-local)](https://www.npmjs.com/package/@concepta/nestjs-auth-local)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Installation

`yarn add @concepta/nestjs-auth-local`

## Introduction

**Overview of the Library**

The `AuthLocalModule` is a robust NestJS module designed for implementing local authentication using username and password. This module leverages the `passport-local` strategy to authenticate users locally within your application.

**Purpose and Key Features**

- **Local Authentication**: Provides a straightforward way to implement local authentication using username and password.
- **Synchronous and Asynchronous Registration**: Flexibly register the module either synchronously or asynchronously, depending on your application's needs.
- **Global and Feature-Specific Registration**: Use the module globally across your application or tailor it for specific features.
- **Customizable**: Easily customize various aspects such as user validation, token issuance, and password validation.

## API Reference

### AuthLocalOptionsInterface

The `AuthLocalOptionsInterface` provides various configuration options to customize the behavior of the `AuthLocalModule`. Below is a summary of the key options:

1. **userLookupService** (required): 
   - Service for looking up user information based on username.

2. **issueTokenService** (optional): 
   - Service for issuing tokens. It implements the `IssueTokenServiceInterface`.

3. **validateUserService** (optional): 
   - Service for validating users. It implements the `AuthLocalValidateUserServiceInterface`.

4. **passwordValidationService** (optional): 
   - Service for validating passwords. It implements the `PasswordValidationServiceInterface`.

5. **settings** (optional): 
   - Settings for the local strategy, including the `loginDto`, `usernameField`, and `passwordField`.

### AuthLocalModule

- **register(options: AuthLocalOptions):**
  - Registers the module with synchronous options.

- **registerAsync(options: AuthLocalAsyncOptions):**
  - Registers the module with asynchronous options.

- **forRoot(options: AuthLocalOptions):**
  - Registers the module globally with synchronous options.

- **forRootAsync(options: AuthLocalAsyncOptions):**
  - Registers the module globally with asynchronous options.

- **forFeature(options: AuthLocalOptions):**
  - Registers the module for specific features with custom options.

## Module Configuration

The `AuthLocalModule` can be customized using various options provided through the `AuthLocalOptionsInterface`. Here is how to configure each property of the options:

1. **userLookupService** (required): 

   This service is responsible for looking up user information based on the username. It implements the `AuthLocalUserLookupServiceInterface`.
```typescript
   import { Injectable } from '@nestjs/common';
   import { AuthLocalUserLookupServiceInterface, AuthLocalCredentialsInterface } from '@concepta/nestjs-auth-local';

   @Injectable()
   export class UserLookupService implements AuthLocalUserLookupServiceInterface {
     async byUsername(username: string): Promise<AuthLocalCredentialsInterface | null> {
       // Implement user lookup logic here
       return null;
     }
   }
```
2. **issueTokenService** (optional): 

   This service handles the issuance of tokens. It implements the `IssueTokenServiceInterface`.
```typescript
   import { Injectable } from '@nestjs/common';
   import { IssueTokenServiceInterface, AuthenticationResponseInterface } from '@concepta/nestjs-authentication';

   @Injectable()
   export class CustomIssueTokenService implements IssueTokenServiceInterface {
     async issueToken(user: any): Promise<AuthenticationResponseInterface> {
       // Implement token issuance logic here
       return { accessToken: 'access-token', refreshToken: 'refresh-token' };
     }
   }
```
3. **validateUserService** (optional): 

   This service handles user validation. It implements the `AuthLocalValidateUserServiceInterface`.
```typescript
   import { Injectable } from '@nestjs/common';
   import { AuthLocalValidateUserServiceInterface, AuthLocalValidateUserInterface } from '@concepta/nestjs-auth-local';
   import { ReferenceIdInterface } from '@concepta/ts-core';

   @Injectable()
   export class CustomValidateUserService implements AuthLocalValidateUserServiceInterface {
     async validateUser(dto: AuthLocalValidateUserInterface): Promise<ReferenceIdInterface> {
       // Implement user validation logic here
       return { id: 'user-id' };
     }
   }
```
4. **passwordValidationService** (optional): 

   This service handles password validation. It implements the `PasswordValidationServiceInterface`.
```typescript
   import { Injectable } from '@nestjs/common';
   import { PasswordValidationServiceInterface } from '@concepta/nestjs-password';

   @Injectable()
   export class CustomPasswordValidationService implements PasswordValidationServiceInterface {
     async validate(password: string, hashedPassword: string): Promise<boolean> {
       // Implement password validation logic here
       return true;
     }
   }
```
5. **settings** (optional): 

   Settings for the local strategy, including the `loginDto`, `usernameField`, and `passwordField`.
```typescript
   import { Type } from '@nestjs/common';

   export class CustomLoginDto {
     username: string;
     password: string;
   }

   export const localSettings = {
     loginDto: CustomLoginDto,
     usernameField: 'username',
     passwordField: 'password'
   };
```
**Example Configuration**
```typescript
import { Module } from '@nestjs/common';
import { AuthLocalModule } from '@concepta/nestjs-auth-local';
import { UserLookupService } from './user-lookup.service';
import { CustomIssueTokenService } from './custom-issue-token.service';
import { CustomValidateUserService } from './custom-validate-user.service';
import { CustomPasswordValidationService } from './custom-password-validation.service';
import { localSettings } from './local-settings';

@Module({
  imports: [
    AuthLocalModule.register({
      userLookupService: new UserLookupService(), // Required
      issueTokenService: new CustomIssueTokenService(), // Optional
      validateUserService: new CustomValidateUserService(), // Optional
      passwordValidationService: new CustomPasswordValidationService(), // Optional
      settings: localSettings, // Optional
    }),
  ],
})
export class AppModule {}
```

## Basic Usage

**How to Set Up the Library in a NestJS Project**

1. **Import the `AuthLocalModule` in your main application module:**

   Import the `AuthLocalModule` and required services in your application module. Ensure to provide the necessary configuration options, including the required `userLookupService`.

**Example of a Simple Use Case**

1. **Create the User Lookup Service:**
```typescript
   import { Injectable } from '@nestjs/common';
   import { AuthLocalUserLookupServiceInterface, AuthLocalCredentialsInterface } from '@concepta/nestjs-auth-local';

   @Injectable()
   export class UserLookupService implements AuthLocalUserLookupServiceInterface {
     async byUsername(username: string): Promise<AuthLocalCredentialsInterface | null> {
       // Implement user lookup logic here
       return null;
     }
   }
```

2. **Set up the Application Module:**
```typescript
   import { Module } from '@nestjs/common';
   import { AuthLocalModule } from '@concepta/nestjs-auth-local';
   import { UserLookupService } from './user-lookup.service';

   @Module({
     imports: [
       AuthLocalModule.register({
         userLookupService: new UserLookupService(), // Required
         // Additional configuration options can be added here
       }),
     ],
   })
   export class AppModule {}
```
   In this example, the `UserLookupService` is required in the configuration options to ensure that the module can correctly look up users based on the username.


## Advanced Usage

The `AuthLocalModule` supports more complex use cases, including global registration with asynchronous options and feature-specific registration. Here are some advanced usage examples:

### Global Registration with Asynchronous Options

To register the module globally with asynchronous options, you need to provide an asynchronous factory function that returns the configuration options.
```typescript
import { Module } from '@nestjs/common';
import { AuthLocalModule } from '@concepta/nestjs-auth-local';
import { ConfigService } from '@nestjs/config';
import { UserLookupService } from './user-lookup.service';
import { CustomIssueTokenService } from './custom-issue-token.service';
import { CustomValidateUserService } from './custom-validate-user.service';
import { CustomPasswordValidationService } from './custom-password-validation.service';
import { localSettings } from './local-settings';

@Module({
  imports: [
    AuthLocalModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        userLookupService: new UserLookupService(), // Required
        issueTokenService: new CustomIssueTokenService(), // Optional
        validateUserService: new CustomValidateUserService(), // Optional
        passwordValidationService: new CustomPasswordValidationService(), // Optional
        settings: localSettings, // Optional
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```
### Example of Asynchronous Options

Here is an example demonstrating the use of asynchronous options with the `AuthLocalModule`.
```typescript
import { Module } from '@nestjs/common';
import { AuthLocalModule } from '@concepta/nestjs-auth-local';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserLookupService } from './user-lookup.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthLocalModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        userLookupService: new UserLookupService(), // Required
        settings: {
          loginDto: CustomLoginDto,
          usernameField: configService.get<string>('USERNAME_FIELD'),
          passwordField: configService.get<string>('PASSWORD_FIELD'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Testing

### Scenario: Users can log in using local authentication

To test this scenario, we will set up an application where users can log in using a username and password. We will create the necessary entities, services, module configurations.

#### Step 1: Create Entities

First, create the `User` entity.
```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
```
#### Step 2: Create Services

Next, create services for `User` to handle the business logic.
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOne(id);
  }

  findByUsername(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
}
```
#### Step 3: Create Controller

Create a controller to handle the HTTP requests.
```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthLocalGuard } from '@concepta/nestjs-auth-local';
import { UserService } from './user.service';

@Controller('auth')
export class AuthController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthLocalGuard)
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.userService.validateUser(body.username, body.password);
    if (user) {
      return { message: 'Login successful' };
    } else {
      return { message: 'Invalid credentials' };
    }
  }
}
```
#### Step 4: Configure the Module

Configure the module to include the necessary services, controllers, and guards.
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthLocalModule } from '@concepta/nestjs-auth-local';
import { User } from './user.entity';
import { UserService } from './user.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthLocalModule.register({
      userLookupService: new UserService(), // Required
    }),
  ],
  controllers: [AuthController],
  providers: [UserService],
})
export class AuthModule {}
```

## Validating the Setup

To validate the setup, you can use `curl` commands to simulate frontend requests. Here are the steps to test the login endpoint:

### Step 1: Obtain a JWT Token

Assuming you have an endpoint to obtain a JWT token, use `curl` to get the token. Replace `auth-url` with your actual authentication URL, and `username` and `password` with valid credentials.
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpassword"}'
```
This should return a response with a login message.

### Example

Here is an example sequence of `curl` commands to validate the login setup:

1. **Login Request:**
```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "testpassword"}'
```
   Example response:
```json
   {
     "message": "Login successful"
   }
```
2. **Invalid Credentials Request:**
```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "wrongpassword"}'
```
   Example response:
```json
   {
     "message": "Invalid credentials"
   }
```