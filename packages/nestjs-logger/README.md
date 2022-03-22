# Rockets NestJS Logger

A nestjs Logger Module

## Installation

Use the package manager [yarn](https://yarnpkg.com/) to install nestjs-logging.

```bash
yarn install nestjs-logging
```

## Usage

To start using the Logger Module, all you will need to do, is import the LoggerModule. We can do that using `LoggerModule.forRoot()` for default configuration, `ConfigModule.forRoot(loggerConfig)` passing a configuration to overwrite the default one (where `loggerConfig` is a object that implements `LoggerOptionsInterface`) or you can overwrite the configuration file with an async call `LoggerModule.forRootAsync()`.

To use the default configuration you need to make sure to define the environments variables, one of the ways you can do that is using `.env` file

```
//.env file

LOG_LEVEL="log,error"
TRANSPORT_LOG_LEVEL="error,warn"
SENTRY_DSN="{your_sentry_dsn}"
```

## Importing module default configuration

```ts

import { LoggerModule } from '@concepta/nestjs-logging';

// To import default configuration
@Module({
  imports: [LoggerModule.forRoot()],
  ...,
})
export class AppModule {}

```

## Importing module by overwriting default configuration

```ts

import { LoggerModule } from '@concepta/nestjs-logging';

// To import overwriting configuration
@Module({
  imports: [ConfigModule.forFeature(loggerConfig)],
  ...,
})
export class AppModule {}

```

## Importing module by overwriting default configuration with async call

```ts
LoggerModule.forRootAsync({
            imports: [ConfigModule.forFeature(loggerConfig)],
            inject: [loggerConfig.KEY],
            useFactory: async (
              config: LoggerOptionsInterface,
            ): Promise<LoggerOptionsInterface> => {
              return {
                ...config,
                logLevel: ['debug'],
                transportLogLevel: ['debug'],
              };
            },
          }),
```

## Using LoggerService

After importing the module with the proper configurations, you are all set to start using the `LoggerService` as injected service.

Is a good practice to also inform nest to use the new Logger internally overwrite the default Logger by calling `app.useLogger(customLoggerService)` passing the `LoggerService` from rockets-logger.

```ts
const app = await NestFactory.create(AppModule);

// Get the Transport to be used with new Logger
const loggerSentryTransport = app.get(LoggerSentryTransport);

// Get reference of LoggerService From LoggerModule
const customLoggerService = app.get(LoggerService);

// Inform that sentry transport will also be used
customLoggerService.addTransport(loggerSentryTransport);

// This is to inform that this logger will new used internally
// or it will be used once yuo do a new Logger()
app.useLogger(customLoggerService);
```

by doing that any time you call a method from `Logger` class from `@nestjs/common` will be calling the method from `LoggerService` from `@concepta/nestjs-logger`.

### Transports

If you define the transport to be used, it means that any method that you call from `LoggerService` will also send the details of the log to the transport defined (at the moment we are only working with Sentry as external transport)
`customLoggerService.addTransport(loggerSentryTransport);`

You should be able to use the `LoggerService` by injecting the class, or creating a new instance of Logger.

```ts
import { Logger, Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '@concepta/nestjs-logger';

@Injectable()
class MyService {
  constructor(@Inject(LoggerService) private loggerService: LoggerService) {
    super();
  }

  doSomething() {
    this.loggerService.log('Doing something...');
  }
}
```

or

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

Check out Nestjs [Logger](https://docs.nestjs.com/techniques/logger#using-the-logger-for-application-logging) if you need more details.

## License

[MIT](https://choosealicense.com/licenses/mit/)
