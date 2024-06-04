# Rockets NestJS JWT Authentication

Authenticate requests using JWT tokens passed via the request (headers, cookies, body, query, etc).

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-auth-jwt)](https://www.npmjs.com/package/@concepta/nestjs-auth-jwt)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-auth-jwt)](https://www.npmjs.com/package/@concepta/nestjs-auth-jwt)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

# AuthJWTModule Documentation

## Introduction

**Overview of the Library**

The `AuthJWTModule` is a powerful yet easy-to-use NestJS module designed for implementing JWT-based authentication. With a few simple steps, you can integrate secure authentication into your application without hassle.

**Purpose and Key Features**

- **Ease of Use**: The primary goal of `AuthJWTModule` is to simplify the process of adding JWT authentication to your NestJS application. All you need to do is provide configuration data, and the module handles the rest.
- **Synchronous and Asynchronous Registration**: Flexibly register the module either synchronously or asynchronously, depending on your application's needs.
- **Global and Feature-Specific Registration**: Use the module globally across your application or tailor it for specific features.
- **Seamless Integration**: Easily integrates with other NestJS modules like `AuthLocalModule`, `AuthRefreshModule`, and more.


## API Reference

Detailed Descriptions of All Classes, Methods, and Properties

### AuthJwtModule

- **register(options: AuthJwtOptions):**
  - Registers the module with synchronous options.

- **registerAsync(options: AuthJwtAsyncOptions):**
  - Registers the module with asynchronous options.

- **forRoot(options: AuthJwtOptions):**
  - Registers the module globally with synchronous options.

- **forRootAsync(options: AuthJwtAsyncOptions):**
  - Registers the module globally with asynchronous options.

- **forFeature(options: AuthJwtOptions):**
  - Registers the module for specific features with custom options.

### AuthJwtOptionsInterface

The `AuthJwtOptionsInterface` provides various configuration options to customize the behavior of the `AuthJwtModule`. Below is a summary of the key options:

1. **userLookupService** (required): 
   - Service for looking up user information based on JWT payload.

2. **verifyTokenService** (optional): 
   - Service for verifying JWT tokens.

3. **appGuard** (optional): 
   - Custom guard to protect routes; can be set to a custom guard or `false`.

4. **settings** (optional): 
   - JWT strategy settings, including token extraction and verification logic.

## Installation

**Step-by-step Installation Guide**

1. **Install the AuthJWTModule package:**

   To get started, install the `@concepta/ts-core`, `@concepta/nestjs-jwt` and `@concepta/nestjs-auth-jwt` packages from npm or yarn:

   ```bash
    npm install class-transformer
    npm install class-validator
    npm install @nestjs/jwt
    npm install @concepta/ts-core
    npm install @concepta/nestjs-authentication
    npm install @concepta/nestjs-jwt
    npm install @concepta/nestjs-auth-jwt
   ```
   or
   ```bash
    yarn add class-transformer
    yarn add class-validator
    yarn add @nestjs/jwt
    yarn add @concepta/ts-core
    yarn add @concepta/nestjs-authentication
    yarn add @concepta/nestjs-jwt
    yarn add @concepta/nestjs-auth-jwt
   ```

2. **Add the AuthJWTModule to Your NestJS Application:**

  Import the `AuthJwtModule` and required services in your application module. Ensure to import `JwtModule` and provide the necessary configuration options, including the required `userLookupService`.

## Module Configuration

This section provides a comprehensive explanation of each configuration option available in the AuthJwtOptionsInterface, along with examples of how to implement and use them in your NestJS application.

1. **userLookupService (required)**

  This service is responsible for looking up user information based on the JWT payload. It implements the `AuthJwtUserLookupServiceInterface` and must be provided to the module.

  ```typescript
  import { AuthJwtUserLookupServiceInterface } from '@concepta/nestjs-auth-jwt';
  import { ReferenceIdInterface, ReferenceSubject } from '@concepta/ts-core';

  export class UserLookupService implements AuthJwtUserLookupServiceInterface {
    async bySubject(subject: ReferenceSubject): Promise<ReferenceIdInterface>  {
      // Implement user lookup logic here
    }
  }
  ```

2. **verifyTokenService (optional)**

  This service verifies JWT tokens. If not provided, the default verification logic will be used. It extends the `VerifyTokenServiceInterface`.

     ```typescript

      import { JwtService } from '@nestjs/jwt';
      import { Injectable } from '@nestjs/common';
      import { VerifyTokenServiceInterface } from '@concepta/nestjs-authentication';
      @Injectable()
      export class YourVerifyTokenService implements VerifyTokenServiceInterface {
        accessToken(): ReturnType<JwtService['verifyAsync']> {
          return new Promise((resolve, reject) => {
            try {
              // your custom logic to sign and validate the the token
              resolve({ accessToken: 'access-token' });
            } catch (error) {
              reject(error);
            }
          });
        }

        refreshToken(
          ...args: Parameters<JwtService['verifyAsync']>
        ): ReturnType<JwtService['verifyAsync']> {
          return new Promise((resolve, reject) => {
            try {
              // your custom logic to sign and validate the the token
              resolve({ accessToken: 'refresh-token' });
            } catch (error) {
              reject(error);
            }
          });
        }
      }
     ```

3. **appGuard (optional)**

  This is a custom guard that can be used to protect routes. It implements the `CanActivate` interface from NestJS. If set to false, no guard will be applied.

  ```typescript
  import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

  @Injectable()
  export class YourCustomAppGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      // Implement guard logic here
      return true;
    }
  }

  ```
4. **settings (optional)**

  This object contains the settings for JWT strategy. It extends the `JwtStrategyOptionsInterface` and allows customization of JWT extraction and verification logic.

  ```typescript
    import { ExtractJwt, JwtStrategyOptionsInterface } from "@concepta/nestjs-jwt";
    const settings: JwtStrategyOptionsInterface = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      verifyToken: async (
        token: string,
        done: (error: any, payload?: any) => void,
      ) => {
        try {
          // add custom logic ot validate token
          const payload = { id: 'user-id' };
          done(null, payload);
        } catch (error) {
          done(error);
        }
      },
    };

  ```


## Basic Usage

How to Set Up the Library in a NestJS Project

1. **Import the AuthJwtModule in your main application module:**

   Import the `AuthJwtModule` and required services in your application module. Ensure to import `JwtModule` and provide the necessary configuration options, including the required `userLookupService`.

## Example of a Simple Use Case

```typescript
import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { JwtModule, ExtractJwt } from '@concepta/nestjs-jwt'; // Import JwtModule and ExtractJwt
import { UserLookupService } from './user-lookup.service';

@Module({
  imports: [
    JwtModule.forRoot({}), // Required for AuthJwtModule to work
    AuthJwtModule.register({
      userLookupService: new UserLookupService(), // Required
      // Additional configuration options can be added here
    }),
  ],
})
export class AppModule {}
```

The `userLookupService` is required in the configuration options to ensure that the module can correctly look up users based on the JWT payload. Additionally, the `JwtModule` is required for the `AuthJwtModule` to function properly. Functions from settings will come by default from `JwtModule`.

## Advanced Usage

### Setting Up a Fake Module for Providers

Before diving into the advanced usage examples, we'll set up a fake module that includes the necessary providers and exports for `UserLookupService`, `YourVerifyTokenService`, and `YourCustomAppGuard`. This will ensure that our asynchronous registration examples can inject these services correctly.

```typescript
import { Module } from '@nestjs/common';
import { UserLookupService } from './user-lookup.service';
import { YourVerifyTokenService } from './verify-token.service';
import { YourCustomAppGuard } from './custom-app-guard';

@Module({
  providers: [UserLookupService, YourVerifyTokenService, YourCustomAppGuard],
  exports: [UserLookupService, YourVerifyTokenService, YourCustomAppGuard],
})
export class FakeProviderModule {}

```

## More Complex Use Cases

### 1. Global Registration with Asynchronous Options
```typescript
import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { JwtModule, ExtractJwt } from '@concepta/nestjs-jwt';
import { ConfigService } from '@nestjs/config';
import { FakeProviderModule } from './fake-provider.module';
import * as jwt from 'jsonwebtoken';

// Define the verifyToken function
const verifyToken = (configService: ConfigService) => async (token: string, done: (error: any, payload?: any) => void) => {
  try {
    const payload = await jwt.verify(token, configService.get('JWT_SECRET'));
    done(null, payload);
  } catch (error) {
    done(error);
  }
};

@Module({
  imports: [
    JwtModule.forRoot({}), // Required for AuthJwtModule to work
    FakeProviderModule, // Import the fake provider module
    AuthJwtModule.forRootAsync({
      imports: [FakeProviderModule],
      useFactory: async (
        configService: ConfigService,
        userLookupService: UserLookupService,
        verifyTokenService: YourVerifyTokenService,
        appGuard: YourCustomAppGuard,
      ) => ({
        userLookupService, // Injected via useFactory
        settings: {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          verifyToken: verifyToken(configService),
        },
        verifyTokenService, // Injected via useFactory
        appGuard, // Injected via useFactory
      }),
      inject: [ConfigService, UserLookupService, YourVerifyTokenService, YourCustomAppGuard],
    }),
  ],
})
export class AppModule {}

```

### 2. Registering the Module with Synchronous Options

```typescript
import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { JwtModule, ExtractJwt } from '@concepta/nestjs-jwt';
import { UserLookupService } from './user-lookup.service';
import * as jwt from 'jsonwebtoken';

// Define the verifyToken function
const verifyToken = async (token: string, done: (error: any, payload?: any) => void) => {
  try {
    const payload = await jwt.verify(token, 'your-secret-key');
    done(null, payload);
  } catch (error) {
    done(error);
  }
};

@Module({
  imports: [
    JwtModule.forRoot({}), // Required for AuthJwtModule to work
    AuthJwtModule.register({
      userLookupService: new UserLookupService(), // Required
      settings: {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        verifyToken,
      },
      verifyTokenService: new YourVerifyTokenService(), // Optional custom service
      appGuard: new YourCustomAppGuard(), // Optional custom guard
    }),
  ],
})
export class AppModule {}

```

### 4. Registering the Module with Asynchronous Options
```typescript
import { Module } from '@nestjs/common';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { JwtModule, ExtractJwt } from '@concepta/nestjs-jwt';
import { ConfigService } from '@nestjs/config';
import { FakeProviderModule } from './fake-provider.module';
import * as jwt from 'jsonwebtoken';

// Define the verifyToken function
const verifyToken = (configService: ConfigService) => async (token: string, done: (error: any, payload?: any) => void) => {
  try {
    const payload = await jwt.verify(token, configService.get('JWT_SECRET'));
    done(null, payload);
  } catch (error) {
    done(error);
  }
};

@Module({
  imports: [
    JwtModule.forRoot({}), // Required for AuthJwtModule to work
    FakeProviderModule, // Import the fake provider module
    AuthJwtModule.registerAsync({
      imports: [FakeProviderModule],
      useFactory: async (
        configService: ConfigService,
        userLookupService: UserLookupService,
        verifyTokenService: YourVerifyTokenService,
        appGuard: YourCustomAppGuard,
      ) => ({
        userLookupService, // Injected via useFactory
        settings: {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          verifyToken: verifyToken(configService),
        },
        verifyTokenService, // Injected via useFactory
        appGuard, // Injected via useFactory
      }),
      inject: [ConfigService, UserLookupService, YourVerifyTokenService, YourCustomAppGuard],
    }),
  ],
})
export class AppModule {}
```

## Integration with Other NestJS Modules

Integrate `nestjs-auth-jwt` with other NestJS modules like `nestjs-user`, `nestjs-auth-local`, `nestjs-auth-refresh`, and more for a comprehensive authentication system.

## Testing

### Scenario: Users can have a list of pets

To test this scenario, we will set up an application where users can have a list of pets. We will create the necessary entities, services, module configurations to simulate the environment.

#### Step 1: Create Entities

First, create the `User` and `Pet` entities.

```typescript
// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pet } from './pet.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Pet, pet => pet.user)
  pets: Pet[];
}

// pet.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, user => user.pets)
  user: User;
}

```

#### Step 2: Create Services

Next, create services for `User` and `Pet` to handle the business logic.

```typescript
// user.service.ts
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
    return this.userRepository.find({ relations: ['pets'] });
  }

  findOne(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['pets'],
    });
  }
}

import { AuthJwtUserLookupServiceInterface } from '@concepta/nestjs-auth-jwt';
import { ReferenceIdInterface, ReferenceSubject } from '@concepta/ts-core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class UserLookupService implements AuthJwtUserLookupServiceInterface {
   constructor(
    private userService: UserService,
  ) {}
  async bySubject(subject: ReferenceSubject): Promise<ReferenceIdInterface> {
    // return authorized user
    return this.userService.findOne(subject);
  }
}


// pet.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './pet.entity';

@Injectable()
export class PetService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) {}

  findAll(): Promise<Pet[]> {
    return this.petRepository.find();
  }

  findByUserId(userId: number): Promise<Pet[]> {
    return this.petRepository.find({ where: { user: { id: userId } } });
  }
}
```

#### Step 3: Create Controller

Create a controller to handle the HTTP requests. Use `@AuthPublic` decorator from `@concepta/nestjs-authentication` if you want to make route public.

```typescript
// user.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { PetService } from './pet.service';
import { AuthJwtGuard } from '@concepta/nestjs-auth-jwt';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private petService: PetService,
  ) {}

  @UseGuards(AuthJwtGuard)
  @Get(':id/pets')
  async getPets(@Param('id') userId: number) {
    return this.petService.findByUserId(userId);
  }
}
```

#### Step 4: Configure the Module

Configure the module to include the necessary services, controllers, and guards.

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PetService } from './pet.service';
import { User } from './user.entity';
import { Pet } from './pet.entity';
import { JwtModule, ExtractJwt } from '@concepta/nestjs-jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Pet]),
    JwtModule.forRoot({}), // Required for AuthJwtModule to work
    AuthJwtModule.registerAsync({
      inject: [UserService],
      useFactory: async (userLookupService: UserService) => ({
        userLookupService,        
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, PetService],
})
export class UserModule {}
```

## Validating the Setup

To validate the setup, you can use `curl` commands to simulate frontend requests. Here are the steps to test the `user/:id/pets` endpoint:

### Step 1: Obtain a JWT Token

Assuming you have an authentication endpoint to obtain a JWT token, use `curl` to get the token. Replace `<auth-url>` with your actual authentication URL, and `<username>` and `<password>` with valid credentials.

```bash
curl -X POST <auth-url> \
  -H "Content-Type: application/json" \
  -d '{"username": "<username>", "password": "<password>"}'
```

This should return a response with a JWT token, which you'll use for authenticated requests.

### Step 2: Make an Authenticated Request
Use the JWT token obtained in the previous step to make an authenticated request to the user/:id/pets endpoint. Replace `jwt-token` with the actual token and `user-id` with a valid user ID.

```bash
curl -X GET http://localhost:3000/user/<user-id>/pets \
  -H "Authorization: Bearer <jwt-token>"
```

### Example
Here is an example sequence of curl commands:

## Obtain a JWT token:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpassword"}'

```

### Example response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Make an authenticated request using the token:


```bash
curl -X GET http://localhost:3000/user/1/pets \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

```

### Example response:
```json
[
  {
    "id": 1,
    "name": "Fluffy",
    "user": {
      "id": 1,
      "name": "John Doe",
      "pets": []
    }
  }
]

```

## Summary
  By following these steps, you can validate that the setup is working correctly and that authenticated requests to the user/:id/pets endpoint return the expected list of pets for a given user.

## Custom Guard and Disabling the Guard

The `AuthJwtModule` allows for customization of route protection using custom guards. You can pass a custom guard to handle specific authentication logic, or you can disable the guard entirely for certain routes.

### Using a Custom Guard

To use a custom guard, you need to implement the `CanActivate` interface from NestJS and provide it in the module configuration.

**Step 1: Implement the Custom Guard**

Create a custom guard by implementing the `CanActivate` interface.

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CustomAppGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Implement your custom authentication logic here
    return true; // Replace with actual logic
  }
}
```

### Step 2: Provide the Custom Guard in Module Configuration

Update the module configuration to use the custom guard.

```typescript
 AuthJwtModule.registerAsync({
      useFactory: async (userLookupService: UserService) => ({
        userLookupService,
        appGuard: CustomAppGuard, // Use the custom guard
      }),
      inject: [UserService],
    }),
  ],
```
## Disabling the Guard
To disable the guard for specific routes, you can set the appGuard option to false.

### Step 1: Disable the Guard in Module Configuration

Update the module configuration to disable the guard.

```typescript
  AuthJwtModule.registerAsync({
      useFactory: async (userLookupService: UserService) => ({
        userLookupService,
        appGuard: false, // Disable the guard
      }),
      inject: [UserService],
    }),
```

## Summary
By using these configurations, you can customize the guard behavior in your application. You can either provide a custom guard for more specific authentication logic or disable the guard entirely for certain routes.