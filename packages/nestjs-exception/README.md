# Rockets NestJS Exception

Provide exception handling/normalization and error code mapping.

For more details on the exception filters pattern, please refer to the official
NestJS [Exception Filters](https://docs.nestjs.com/exception-filters) documentation.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-exception)](https://www.npmjs.com/package/@concepta/nestjs-exception)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-exception)](https://www.npmjs.com/package/@concepta/nestjs-exception)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Installation

`yarn add @concepta/nestjs-exception`

## Binding The Filer

You can bind the filter to classes, methods and globally.

### Class Decorator

```ts
// ...
import { ExceptionsFilter } from '@concepta/nestjs-exception';

@UseFilters(new ExceptionsFilter())
export class PhotoController {
  // ...
}
```

### Method Decorator

```ts
// ...
import { ExceptionsFilter } from '@concepta/nestjs-exception';

@Post()
@UseFilters(new ExceptionsFilter())
async create(@Body() createPhotoDto: CreatePhotoDto) {
  throw new ForbiddenException();
}
```

### Global Filter

```ts
// ...
import { ExceptionsFilter } from '@concepta/nestjs-exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ExceptionsFilter());
  await app.listen(3000);
}
bootstrap();
```

## TODO

- Define interface for exception filter response payload.
