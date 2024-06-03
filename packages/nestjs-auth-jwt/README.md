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

## Installation

**Step-by-step Installation Guide**

1. **Install the AuthJWTModule package:**

   To get started, install the `yarn add @concepta/nestjs-auth-jwt` package from npm:

   ```bash
   npm install @concepta/nestjs-auth-jwt
   ```

2. **Add the AuthJWTModule to Your NestJS Application:**

  Import the `AuthJwtModule` and required services in your application module. Ensure to import `JwtModule` and provide the necessary configuration options, including the required `userLookupService`.

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

### 2. Feature-Specific Registration

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
    AuthJwtModule.forFeature({
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
export class FeatureModule {}

```

### 3. Registering the Module with Synchronous Options

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

Integrate AuthJwtModule with other NestJS modules like UserModule, AuthLocalModule, AuthRefreshModule, and more for a comprehensive authentication system.

## API Reference

Detailed Descriptions of All Classes, Methods, and Properties

### AuthJwtModule

**register(options: AuthJwtOptions):** Registers the module with synchronous options.
**registerAsync(options: AuthJwtAsyncOptions):** Registers the module with asynchronous options.
**forRoot(options: AuthJwtOptions):** Registers the module globally with synchronous options.
**forRootAsync(options: AuthJwtAsyncOptions):** Registers the module globally with asynchronous options.
**forFeature(options: AuthJwtOptions):** Registers the module for specific features with custom options.

