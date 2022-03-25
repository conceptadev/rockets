[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-exception)](https://www.npmjs.com/package/@concepta/nestjs-exception)
[![NPM Alpha](https://img.shields.io/npm/v/@concepta/nestjs-exception/alpha)](https://www.npmjs.com/package/@concepta/nestjs-nestjscontrol)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-exception)](https://www.npmjs.com/package/@concepta/nestjs-exception)

[![GitHub Open Issues](https://img.shields.io/github/issues/conceptadev/rockets/nestjs-exception)](https://github.com/conceptadev/rockets/labels/nestjs-exception)
[![GitHub Closed Issues](https://img.shields.io/github/issues-closed/conceptadev/rockets/nestjs-exception)](https://github.com/conceptadev/rockets/labels/nestjs-exception)
[![GitHub Open PRs](https://img.shields.io/github/issues-pr/conceptadev/rockets/nestjs-exception)](https://github.com/conceptadev/rockets/labels/nestjs-exception)
[![GitHub Closed PRs](https://img.shields.io/github/issues-pr-closed/conceptadev/rockets/nestjs-exception)](https://github.com/conceptadev/rockets/labels/nestjs-exception)

# Rockets NestJS Exception

Provide exception handling/normalization and error code mapping.

For more details on the exception filters pattern, please refer to the official
NestJS [Exception Filters](https://docs.nestjs.com/exception-filters) documentation.

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
