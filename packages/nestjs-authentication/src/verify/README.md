# Rockets NestJS Auth verify Authentication

Verify user password using email

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-auth-verify)](https://www.npmjs.com/package/@concepta/nestjs-auth-verify)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-auth-verify)](https://www.npmjs.com/package/@concepta/nestjs-auth-verify)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Table of Contents

- [Tutorials](#tutorials)
  - [Introduction](#introduction)
  - [Email Configuration](#email-configuration)
  - [Setup Auth Verify Module](#setup-auth-verify-module)

- [How-To Guides](#how-to-guides)
  - [1. How to define the AuthVerifySettings](#1-how-to-define-the-authverifysettings)
  - [2. How to define the OtpService](#2-how-to-define-the-otpservice)
  - [3. How to define EmailService](#3-how-to-define-the-emailservice)
  - [4. How to define the UserLookupService](#4-how-to-define-the-userlookupservice)
  - [5. How to define the UserMutateService](#5-how-to-define-the-usermutateservice)
  - [6. How to define the NotificationService](#6-how-to-define-the-notificationservice)
  - [7. How to define the EntityManagerProxy](#7-how-to-define-the-entitymanagerproxy)

- [Engineering Concepts](#engineering-concepts)
  - [1. Dynamic Configuration Settings](#1-dynamic-configuration-settings)
  - [2. Dynamic OTP service](#2-dynamic-otp-service)
  - [3. Dynamic Email Service](#3-dynamic-email-service)
  - [4. User Lookup Service](#4-user-lookup-service)
  - [5. User Mutate Service](#5-user-mutate-service)
  - [6. Notification Service (Optional)](#6-notification-service-optional)
  - [7. Entity Manager Proxy (Optional)](#7-entity-manager-proxy-optional)

## Tutorials

### Introduction

The Auth Verify module provides functionality to verify user accounts
via email. Before getting started, ensure you have email sending
capabilities set up in your application.

The module relies on the following key components:

- `@nestjs-modules/mailer` for email delivery
- `@concepta/nestjs-email` for email service integration

The module already implements all the necessary logic for email
verification through these key classes:

- `AuthVerifyService` - Core service for managing verification
- `AuthVerifyNotificationService` - Handles sending verification emails
- `AuthVerifyController` - Exposes verification endpoints

Let's walk through setting up the required email configuration first.
Note that you can use any email setup that works for your needs, but for
this tutorial we'll demonstrate using `@concepta/nestjs-email`,
`@nestjs-modules/mailer` and with Mailgun.

#### Installation

`yarn add @concepta/nestjs-auth-verify`

### Email Configuration

For detailed instructions on setting up email functionality, please
follow the tutorial in the [@concepta/nestjs-email README](https://github.com/conceptadev/rockets/tree/main/packages/nestjs-email#tutorial).

The tutorial covers:

- Creating email configuration with mailer options
- Setting up SMTP transport settings
- Configuring email templates
- Initializing the required modules (EmailModule and MailerModule)

Once you have email properly configured following those instructions,
you can proceed with setting up the verification module below.

### Setup Auth Verify Module

```ts
import { AuthVerifySettingsInterface } from '@concepta/nestjs-auth-verify';
import { registerAs } from '@nestjs/config';

/**
 * Default configuration for auth verify.
 */
export const authVerifyDefaultConfig = registerAs(
  "STARTER_AUTH_VERIFY_MODULE_DEFAULT_SETTINGS_TOKEN",
  (): AuthVerifySettingsInterface => ({
    email: {
      from: 'from',
      baseUrl: 'baseUrl',
      templates: {
        verifyEmail: {
          fileName: `${__dirname}/../${
            process.env?.NODEMAILER_TEMPLATE_PATH ?? 'assets/templates/email'
          }/verify.template.hbs`,
          subject: 'Password Recovery',
        },
      },
    },
    otp: {
      assignment: 'userOtp',
      category: 'auth-verify',
      type: 'uuid',
      expiresIn: '24h',
    },
  }),
);
```

Let's take advantage of the following modules to set up the verify
module:

- [@concepta/nestjs-user](https://github.com/conceptadev/rockets/tree/main/packages/nestjs-user)
  - Provides `UserLookupService` to get users and `UserMutateService` to
    update them
- [@concepta/nestjs-otp](https://github.com/conceptadev/rockets/tree/main/packages/nestjs-otp)
  - Provides `OtpService` to create one-time passwords
- [@concepta/nestjs-email](https://github.com/conceptadev/rockets/tree/main/packages/nestjs-email)
  - Provides `EmailService` to send emails

Please refer to each module's documentation linked above to see how to
properly set them up in your application.

Assuming both `@concepta/nestjs-user` and `@concepta/nestjs-otp` are
configured, we can proceed with setting up the verify module. While the
use of these modules is optional, it is recommended to use them to take
advantage of their pre-built services and functionality.

```ts
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { mailerConfig } from './config/mailer.config';
import { authVerifyDefaultConfig } from './config/auth-verify-default.config';
import { AuthVerifyModule } from '@concepta/nestjs-auth-verify';
import { EmailModule, EmailService } from '@concepta/nestjs-email';
import {
  UserLookupService,
  UserMutateService,
} from '@concepta/nestjs-user';
import {
  OtpService,
  OtpModule,
} from '@concepta/nestjs-otp';

/// ...
@Module({
  imports: [
    ///
    AuthVerifyModule.forRootAsync({
      inject: [
        UserLookupService,
        UserMutateService,
        OtpService,
        EmailService,
        authVerifyDefaultConfig.KEY,
      ],
      useFactory: (
        userLookupService,
        userMutateService,
        otpService,
        emailService,
        settings: ConfigType<typeof authVerifyDefaultConfig>,
      ) => ({
        userLookupService,
        userMutateService,
        otpService,
        emailService,
        settings,
      }),
    }),
    //... 
}

```

The module exposes the following endpoints:

- `POST /auth/verify/send` - Sends a verification email to the user
- `PATCH /auth/verify/confirm` - Confirms the verification code received
  in the email

These endpoints handle the email verification flow, allowing users to
verify their email addresses and activate their accounts.

Once the module is setup, we can send a request to the
`/auth/verify/send` endpoint to send a verify email to the user.

```ts
curl -X 'POST' \
  'http://localhost:3001/auth/verify/send' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user-email@email.com"
}'
```

An email will be sent to the user containing a verification code. Once
the user receives the email, they can use the verification code to
confirm their email address. To validate the code, send a request to the
`/auth/verify/confirm` endpoint with the code received in the email.

```ts
curl -X 'PATCH' \
  'http://localhost:3001/auth/verify/confirm' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "passcode": "123455"
}'
```

if the code is valid, the user will be verified and the user status will be
updated to active.

## How-To Guides

### 1. How to define the AuthVerifySettings

The `AuthVerifySettingsInterface` allows you to configure various
settings for the authentication verification module. These settings
control the behavior of the verification process, including OTP
configuration and email templates.

Here's an example of how to define the settings:

```ts
import { AuthVerifySettingsInterface } from '@concepta/nestjs-auth-verify';
import { registerAs } from '@nestjs/config';

/**
 * Default configuration for auth verify.
 */
export const authVerifyDefaultConfig = registerAs(
  "YOUR_AUTH_VERIFY_MODULE_DEFAULT_SETTINGS_TOKEN",
  (): AuthVerifySettingsInterface => ({
    email: {
      from: 'from',
      baseUrl: 'baseUrl',
      templates: {
        verifyEmail: {
          fileName: `${__dirname}/../${
            process.env?.NODEMAILER_TEMPLATE_PATH ?? 'assets/templates/email'
          }/verify.template.hbs`,
          subject: 'Password Recovery',
        },
      },
    },
    otp: {
      assignment: 'userOtp',
      category: 'auth-verify',
      type: 'uuid',
      expiresIn: '24h',
    },
  }),
);
```

Now let's add the new settings to our module.

```ts
uthVerifyModule.forRootAsync({
      inject: [
        //...
        authVerifyDefaultConfig.KEY,
      ],
      useFactory: (
        //...
        settings: ConfigType<typeof authVerifyDefaultConfig>,
      ) => ({
        //...
        settings,
      }),
    }),
```

### 2. How to define the OtpService

The `OtpService` is responsible for handling the creation and validation
of one-time passwords (OTP) used in the email verification process. This
service must implement the `AuthVerifyOtpServiceInterface` interface,
which defines the required methods for OTP management.

The service should handle:

- Creating new OTP codes when verification emails are requested
- Validating OTP codes submitted during the confirmation step
- Managing OTP expiration and usage limits

Here's an example of how to implement the OTP service:

```ts
import {
  OtpCreatableInterface, OtpInterface,
  ReferenceAssigneeInterface,
  ReferenceAssignment,
  OtpCreateParamsInterface
} from '@concepta/nestjs-common';
import {
  QueryOptionsInterface
} from '@concepta/typeorm-common';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OtpServiceInterface } from '../interfaces/otp-service.interface';
import { OtpSettingsInterface } from '../interfaces/otp-settings.interface';
import {
  OTP_MODULE_REPOSITORIES_TOKEN,
  OTP_MODULE_SETTINGS_TOKEN,
} from '../otp.constants';

@Injectable()
export class YourAuthVerifyOtpService implements AuthVerifyOtpServiceInterface {
  constructor() {}

  async create(
    params: OtpCreateParamsInterface
  ): Promise<OtpInterface> {
    // your custom logic to create OTP
  }

  async validate(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'category' | 'passcode'>,
    deleteIfValid = false,
    queryOptions?: QueryOptionsInterface,
  ): Promise<ReferenceAssigneeInterface | null> {
    // your custom logic to validate OTP
  }

  async clear(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category'>,
    queryOptions?: QueryOptionsInterface,
  ): Promise<void> {
    // your custom logic to clear OTP
  }
}
```

Now let's add the new OTP service to our module.

```ts
AuthVerifyModule.forRootAsync({
      inject: [
        //...
        YourAuthVerifyOtpService,
        //...
      ],
      useFactory: (
        //...
        otpService,
        //...
      ) => ({
        //...
        otpService,
        //...
      }),
    }),
```

### 3. How to define the EmailService

```ts
import { EmailSendOptionsInterface } from '@concepta/nestjs-common';
import { Injectable } from '@nestjs/common';
import { AuthVerifyEmailServiceInterface } from '@nestjs/nestjs-auth-verify';

@Injectable()
export class YourAuthVerifyEmailService 
  implements AuthVerifyEmailServiceInterface {
  constructor() {}

  public async sendMail(dto: EmailSendOptionsInterface): Promise<void> {
    // your custom logic to send email
  }
}
```

Now let's add the new email service to our module.

```ts
AuthVerifyModule.forRootAsync({
      inject: [
        //...
        YourAuthVerifyEmailService,
        //...
      ],
      useFactory: (
        //...
        emailService,
        //...
      ) => ({
        //...
        emailService,
        //...
      }),
    }),
```

### 4. How to define the UserLookupService

```ts
import {
  LookupEmailInterface,
  LookupIdInterface,
  ReferenceEmail,
  ReferenceId,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YourAuthVerifyUserLookupService
  implements AuthVerifyUserLookupServiceInterface {
  
  async findById(
    id: ReferenceId,
    options?: QueryOptionsInterface,
  ): Promise<ReferenceIdInterface | null> {
    // your custom logic to find user by ID
  }

  async findByEmail(
    email: ReferenceEmail,
    options?: QueryOptionsInterface,
  ): Promise<ReferenceIdInterface & ReferenceUsernameInterface | null> {
    // your custom logic to find user by email
  }
}
```

Now let's add the new user lookup service to our module:

```ts
AuthVerifyModule.forRootAsync({
  inject: [
    //...
    YourAuthVerifyUserLookupService,
    //...
  ],
  useFactory: (
    //...
    userLookupService,
    //...
  ) => ({
    //...
    userLookupService,
    //...
  }),
}),
```

### 5. How to define the UserMutateService

Here's an example of how to implement the `UserMutateService`:

```ts
import {
  ReferenceActiveInterface,
  ReferenceEmailInterface,
  ReferenceIdInterface,
  UpdateOneInterface,
} from '@concepta/nestjs-common';
import { QueryOptionsInterface } from '@concepta/typeorm-common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YourAuthVerifyUserMutateService
  implements AuthVerifyUserMutateServiceInterface {
  
  async update(
    user: ReferenceIdInterface & ReferenceActiveInterface,
    options?: QueryOptionsInterface,
  ): Promise<
    ReferenceIdInterface & 
    ReferenceEmailInterface & 
    ReferenceActiveInterface
  > {
    // your custom logic to update user details
  }
}
```

Now let's add the new user mutate service to our module:

```ts
AuthVerifyModule.forRootAsync({
  inject: [
    //...
    YourAuthVerifyUserMutateService,
    //...
  ],
  useFactory: (
    //...
    userMutateService,
    //...
  ) => ({
    //...
    userMutateService,
    //...
  }),
}),
```

### 6. How to define the NotificationService

Here's an example of how to implement the `NotificationService`:

```ts
import { EmailSendOptionsInterface } from '@concepta/nestjs-common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YourAuthVerifyNotificationService
  implements AuthVerifyNotificationServiceInterface {
  
  async sendEmail(sendMailOptions: EmailSendOptionsInterface): Promise<void> {
    // your custom logic to send a general email
  }

  async sendVerifyEmail(
    email: string,
    passcode: string,
    resetTokenExp: Date,
  ): Promise<void> {
    // your custom logic to send a verification email
  }
}
```

Now let's add the new notification service to our module:

```ts
AuthVerifyModule.forRootAsync({
  inject: [
    //...
    YourAuthVerifyNotificationService,
    //...
  ],
  useFactory: (
    //...
    notificationService,
    //...
  ) => ({
    //...
    notificationService,
    //...
  }),
}),
```

### 7. How to define the EntityManagerProxy

Here's an example of how to implement the `EntityManagerProxy`:

```ts

import { EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { EntityManagerOptionInterface } from '../interfaces/entity-manager-option.interface';
import { QueryOptionsInterface } from '../interfaces/query-options.interface';
import { SafeTransactionOptionsInterface } from '../interfaces/safe-transaction-options.interface';
import { TransactionProxy } from './transaction.proxy';

export class EntityManagerProxy {
  constructor(private _entityManager: EntityManager) {}

  entityManager() {
    return this._entityManager;
  }

  repository<T extends ObjectLiteral>(
    repository: Repository<T>,
    options?: QueryOptionsInterface & EntityManagerOptionInterface,
  ): Repository<T> {
    if (options?.transaction) {
      return options.transaction.repository(repository);
    } else if (
      options?.entityManager &&
      options?.entityManager !== repository.manager
    ) {
      return options.entityManager.withRepository<T, Repository<T>>(repository);
    } else {
      return repository;
    }
  }

  transaction(options?: SafeTransactionOptionsInterface): TransactionProxy {
    return new TransactionProxy(this._entityManager, options);
  }
}

```

## Engineering Concepts

### 1. Dynamic Configuration Settings

In designing the dynamic configuration settings for the authentication
verification module, several key decisions were made to ensure
flexibility, maintainability, and scalability:

These choices were made to create a robust configuration system that
adapts to various operational needs while maintaining a clean and
organized codebase. This approach not only enhances the application's
flexibility but also simplifies the process of managing and updating
configurations as the application evolves.

### 2. Dynamic OTP service

The OTP (One-Time Password) service is a crucial component that handles
the generation, validation, and management of verification tokens. The
service must implement the `AuthVerifyOtpServiceInterface` which defines
three core methods:

- `create()`: Generates a new OTP token associated with a specific user
  assignment
- `validate()`: Verifies if a provided OTP token is valid for the given
  assignment
- `clear()`: Removes existing OTP tokens for a user assignment

While you can implement your own custom OTP service logic, the
`@concepta/nestjs-otp` module provides a ready-to-use implementation that
handles:

- Secure token generation using configurable algorithms (UUID, numeric
  codes, etc)
- Token expiration and lifecycle management
- Storage and retrieval of OTP records
- Built-in validation logic with configurable rules

Using the `@concepta/nestjs-otp` module can significantly reduce
development time while ensuring secure and reliable OTP functionality.
The module seamlessly integrates with the auth verification flow and
follows best practices for OTP implementation.

The OTP service implementation requires implementing the
`AuthVerifyOtpServiceInterface`. Here's an example of leveraging the
`@concepta/nestjs-otp` module in your OTP service:

See [2. How to Define the OtpService](#2-how-to-define-the-otpservice)
under How-To Guides for more details on implementing the OTP service.

### 3. Dynamic Email Service

The email service is responsible for handling email delivery in the
verification process. It must implement the `AuthVerifyEmailServiceInterface`
which extends the `EmailSendInterface`. The key method to implement is:

- `sendMail()`: Handles sending the verification email to users

See [3. How to define the EmailService](#3-how-to-define-the-emailservice)
under How-To Guides for more details on implementing the EmailService.

### 4. User Lookup Service

The user lookup service is responsible for retrieving user information
during the verification process. It must implement the
`AuthVerifyUserLookupServiceInterface` which extends both
`LookupIdInterface` and `LookupEmailInterface`. The key methods to
implement are:

- `byId()`: Retrieves a user by their unique identifier
- `byEmail()`: Retrieves a user by their email address

The lookup service provides a standardized way to query user data
regardless of your underlying user storage implementation. This
abstraction allows the auth verification module to work with any user
data source while maintaining a consistent interface.

### 5. User Mutate Service

The user mutate service handles updating user data during the verification
process. It must implement the `AuthVerifyUserMutateServiceInterface` which
extends the `UpdateOneInterface`. The key method to implement is:

- `update()`: Updates user data with verification status changes

This service is crucial for persisting verification state changes to your user
records. For example, when a user successfully verifies their email, the mutate
service updates their account to reflect the verified status.

The mutate service works in conjunction with the lookup service to provide
a complete user data management solution. While the lookup service handles
retrieving user information, the mutate service manages modifications to
user data.

See [5. How to Define the UserMutateService](#5-how-to-define-the-usermutateservice)
under How-To Guides for more details on implementing the UserMutateService.

### 6. Notification Service (Optional)

The notification service is an optional component that handles sending
verification-related notifications to users. It must implement the
`AuthVerifyNotificationServiceInterface`. The key methods to implement are:

- `sendEmail()`: Sends a generic email using the provided options
- `sendVerifyEmail()`: Sends a verification email with the passcode and
expiration

The notification service provides a higher-level abstraction over the
email service, specifically tailored for verification-related communications.
It handles formatting verification emails with the correct templates and
context data.

When implemented, the notification service:

- Uses configured email templates
- Formats verification URLs
- Includes token expiration information
- Manages email sending through the underlying email service

While optional, implementing a notification service can help standardize your
verification-related communications and reduce code duplication. The module
provides a default implementation that you can use or extend.

See [6. How to Define the NotificationService](#6-how-to-define-the-notificationservice)
under How-To Guides for more details on implementing the NotificationService.

### 7. Entity Manager Proxy (Optional)

The entity manager proxy is an optional component that provides transaction
management capabilities for database operations. It wraps TypeORM's
EntityManager to provide a consistent interface for managing database
transactions across the verification process.

When provided, the entity manager proxy:

- Manages database transactions for verification operations
- Ensures data consistency during multi-step processes
- Provides rollback capabilities if errors occur

The proxy is particularly useful when:

- Updating user verification status
- Creating and managing OTP tokens
- Coordinating multiple database operations

The EntityManagerProxy class offers several key methods:

- `entityManager()`: Returns the underlying EntityManager instance
- `repository()`: Gets a repository instance with transaction context
- `transaction()`: Creates a new transaction context

While optional, using the entity manager proxy is recommended when your
verification process involves multiple database operations that need to
maintain consistency. The module's core services are designed to work
with the proxy when available.

See [7. How to define the EntityManagerProxy](#7-how-to-define-the-entitymanagerproxy)
under How-To Guides for more details on implementing and using
the EntityManagerProxy.
