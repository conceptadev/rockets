# Rockets NestJS Logger

This module is a drop-in replacement for the core NestJS logger that provides additonal support for pushing log data
to one or multiple external log consumption providers.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-logger)](https://www.npmjs.com/package/@concepta/nestjs-logger)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-logger)](https://www.npmjs.com/package/@concepta/nestjs-logger)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-common%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Overview

This module wraps/extends the core NestJS `Logger` and adds a powerful external transports plugin interface.

> See the NestJS [Logger](https://docs.nestjs.com/techniques/logger) documentation
> for more details on how logging is implemented in NestJS.

## Installation

`yarn add @concepta/nestjs-logger`

## Registering

To start using the Logger Module, import the LoggerModule into your app.

### Defaults (.env)

To register using the default configuration:

```ts
@Module({
  imports: [
    LoggerModule.register()
  ]
});
export class App {}
```

To use the default configuration, you need todefine the environments variables.
One of the ways you can do that is using `.env` file

```zsh
// .env file

LOG_LEVEL="log,error"
TRANSPORT_LOG_LEVEL="error,warn"
SENTRY_DSN="{your_sentry_dsn}"
```

### Synchronous Registration

To register by direct configuration:

```ts
// ...
import { LoggerModule } from '@concepta/nestjs-logger';

@Module({
  imports: [
    LoggerModule.register({
      // ...
    })
  ]
});
export class App {}
```

### Aynchronous Registration

To register by direct configuration:

```ts
// ...
import { LoggerModule } from '@concepta/nestjs-logger';

@Module({
  imports: [
    LoggerModule.registerAsync({
      imports: [ConfigModule.forFeature(myConfig)],
      inject: [myConfig.KEY],
      useFactory: async (
        appConfig: MyAppOptionsInterface,
      ): Promise<LoggerOptionsInterface> => appConfig.logger
  ]
});
export class App {}
```

### Transports

If you define the transport to be used, it means that any method that you call from `LoggerService`
will also send the details of the log to the transport defined
(at the moment we are only working with Sentry as external transport).

You can easily create your own custom transports by developing a class that meets the interface.

```ts
// ...
import { LoggerModule, LoggerSentryTransport } from '@concepta/nestjs-logger';

@Module({
  imports: [
    LoggerModule.register({
      transports: [LoggerSentryTransport],
    })
  ]
});
export class App {}
```

## Using LoggerService

After importing the module with the proper configurations, you are all set to start using the `LoggerService` as an injected service.

### Setup Globally

It is a good practice to also inform nest to use the new Logger internally overwrite the default Logger in your bootstrap.

```ts
// ...
import { LoggerService } from '@concepta/nestjs-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // get reference of LoggerService From LoggerModule
  const customLoggerService = app.get(LoggerService);

  // this is to inform that this logger will be used globally
  // and it will be used once you create a new Logger()
  app.useLogger(customLoggerService);

  await app.listen(3000);
}
bootstrap();
```

Now any time you call a method from `Logger` class from `@nestjs/common` will be calling the same
method from `LoggerService` from `@concepta/nestjs-logger`

### Injection

You should be able to use the `LoggerService` by injecting the class, or creating a new instance of Logger.

```ts
import { Logger, Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '@concepta/nestjs-logger';

@Injectable()
class MyService {
  constructor(@Inject(LoggerService) private loggerService: LoggerService) {}

  doSomething() {
    this.loggerService.log('Doing something...');
  }
}
```

### Manual Instantiation

```ts
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
class MyService {
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log('Doing something...');
  }
}
```
