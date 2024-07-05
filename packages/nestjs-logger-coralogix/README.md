# Rockets NestJS Coralogix

This module is a drop-in replacement for the core NestJS coralogix that provides additonal support for pushing log data
to one or multiple external log consumption providers.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-coralogix)](https://www.npmjs.com/package/@concepta/nestjs-coralogix)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-coralogix)](https://www.npmjs.com/package/@concepta/nestjs-coralogix)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Overview

This module wraps/extends the core NestJS `Coralogix` and adds a powerful external transports plugin interface.

> See the NestJS [Coralogix](https://docs.nestjs.com/techniques/coralogix) documentation
> for more details on how logging is implemented in NestJS.

## Installation

`yarn add @concepta/nestjs-coralogix`

## Registering

To start using the Coralogix Module, import the CoralogixModule into your app.

### Defaults (.env)

To register using the default configuration:

```ts
@Module({
  imports: [
    CoralogixModule.register()
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
import { CoralogixModule } from '@concepta/nestjs-coralogix';

@Module({
  imports: [
    CoralogixModule.register({
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
import { CoralogixModule } from '@concepta/nestjs-coralogix';

@Module({
  imports: [
    CoralogixModule.registerAsync({
      imports: [ConfigModule.forFeature(myConfig)],
      inject: [myConfig.KEY],
      useFactory: async (
        appConfig: MyAppOptionsInterface,
      ): Promise<CoralogixOptionsInterface> => appConfig.coralogix
  ]
});
export class App {}
```

### Transports

If you define the transport to be used, it means that any method that you call from `CoralogixService`
will also send the details of the log to the transport defined
(at the moment we are only working with Sentry as external transport).

You can easily create your own custom transports by developing a class that meets the interface.

```ts
// ...
import { CoralogixModule, CoralogixSentryTransport } from '@concepta/nestjs-coralogix';

@Module({
  imports: [
    CoralogixModule.register({
      transports: [CoralogixSentryTransport],
    })
  ]
});
export class App {}
```

## Using CoralogixService

After importing the module with the proper configurations, you are all set to start using the `CoralogixService` as an injected service.

### Setup Globally

It is a good practice to also inform nest to use the new Coralogix internally overwrite the default Coralogix in your bootstrap.

```ts
// ...
import { CoralogixService } from '@concepta/nestjs-coralogix';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // get reference of CoralogixService From CoralogixModule
  const customCoralogixService = app.get(CoralogixService);

  // this is to inform that this coralogix will be used globally
  // and it will be used once you create a new Coralogix()
  app.useCoralogix(customCoralogixService);

  await app.listen(3000);
}
bootstrap();
```

Now any time you call a method from `Coralogix` class from `@nestjs/common` will be calling the same
method from `CoralogixService` from `@concepta/nestjs-coralogix`

### Injection

You should be able to use the `CoralogixService` by injecting the class, or creating a new instance of Coralogix.

```ts
import { Coralogix, Injectable, Inject } from '@nestjs/common';
import { CoralogixService } from '@concepta/nestjs-coralogix';

@Injectable()
class MyService {
  constructor(@Inject(CoralogixService) private coralogixService: CoralogixService) {}

  doSomething() {
    this.coralogixService.log('Doing something...');
  }
}
```

### Manual Instantiation

```ts
import { Coralogix, Injectable } from '@nestjs/common';

@Injectable()
class MyService {
  private readonly coralogix = new Coralogix(MyService.name);

  doSomething() {
    this.coralogix.log('Doing something...');
  }
}
```
