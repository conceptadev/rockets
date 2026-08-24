import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { RuntimeException } from '@concepta/nestjs-core';
import request from 'supertest';
import { ExceptionsFilter, ERROR_MESSAGE_FALLBACK } from './exceptions.filter';
import {
  attachErrorDetails,
  detailedErrorSerializer,
} from '@concepta/rockets-core';

class TestRuntimeException extends RuntimeException {
  constructor(
    options: ConstructorParameters<typeof RuntimeException>[0],
    code: string,
  ) {
    super(options);
    this.errorCode = code;
  }
}

@ApiTags('test-errors')
@Controller('test-errors')
class TestErrorController {
  @Get('runtime-500-with-safe')
  @ApiOkResponse({ description: 'Always throws — test route' })
  runtimeSafe500(): never {
    throw new TestRuntimeException(
      {
        message: 'Internal error detail',
        httpStatus: 500,
        safeMessage: 'Something went wrong',
      },
      'RUNTIME_500_SAFE',
    );
  }

  @Get('runtime-500-no-safe')
  @ApiOkResponse({ description: 'Always throws — test route' })
  runtimeNoSafe500(): never {
    throw new TestRuntimeException(
      {
        message: 'Raw internal error',
        httpStatus: 500,
      },
      'RUNTIME_500_NO_SAFE',
    );
  }

  @Get('runtime-400-with-safe')
  @ApiOkResponse({ description: 'Always throws — test route' })
  runtime400Safe(): never {
    throw new TestRuntimeException(
      {
        message: 'Bad input detail',
        httpStatus: 400,
        safeMessage: 'Invalid request',
      },
      'RUNTIME_400_SAFE',
    );
  }

  @Get('runtime-400-no-safe')
  @ApiOkResponse({ description: 'Always throws — test route' })
  runtime400NoSafe(): never {
    throw new TestRuntimeException(
      {
        message: 'Detailed client error',
        httpStatus: 400,
      },
      'RUNTIME_400_NO_SAFE',
    );
  }

  @Get('runtime-default-status')
  @ApiOkResponse({ description: 'Always throws — test route' })
  runtimeDefaultStatus(): never {
    throw new TestRuntimeException(
      { message: 'No explicit httpStatus set' },
      'RUNTIME_DEFAULT',
    );
  }

  @Get('runtime-400-no-safe-no-message')
  @ApiOkResponse({ description: 'Always throws — test route' })
  runtime400NoSafeNoMessage(): never {
    throw new TestRuntimeException(
      { message: '', httpStatus: 400 },
      'RUNTIME_400_EMPTY',
    );
  }

  @Get('validation-errors')
  @ApiOkResponse({ description: 'Always throws — test route' })
  validationErrors(): never {
    const err = new TestRuntimeException(
      { message: 'Validation failed' },
      'VALIDATION_ERR',
    );
    err.context = {
      ...err.context,
      validationErrors: [
        {
          property: 'name',
          constraints: { isNotEmpty: 'name should not be empty' },
        },
      ],
    };
    throw err;
  }

  @Get('validation-errors-attached')
  @ApiOkResponse({ description: 'Always throws — test route' })
  validationErrorsAttached(): never {
    // Both channels on one exception: a symbol payload from
    // attachErrorDetails AND context.validationErrors. The filter must
    // keep the app's explicit attachment, not clobber it with the
    // derived class-validator details.
    const err = new TestRuntimeException(
      { message: 'Validation failed' },
      'VALIDATION_ERR',
    );
    err.context = {
      ...err.context,
      validationErrors: [
        {
          property: 'name',
          constraints: { isNotEmpty: 'name should not be empty' },
        },
      ],
    };
    attachErrorDetails(err, [
      { path: ['name'], message: 'app-attached finding' },
    ]);
    throw err;
  }

  @Get('unknown-error')
  @ApiOkResponse({ description: 'Always throws — test route' })
  unknownError(): never {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw { message: 'plain object error' };
  }
}

describe('ExceptionsFilter (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestErrorController],
    }).compile();

    app = moduleRef.createNestApplication();

    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new ExceptionsFilter(httpAdapterHost));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return safeMessage for RuntimeException with httpStatus 500 and safeMessage', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-errors/runtime-500-with-safe')
      .expect(500);

    expect(response.body.statusCode).toBe(500);
    expect(response.body.errorCode).toBe('RUNTIME_500_SAFE');
    expect(response.body.message).toBe('Something went wrong');
    expect(response.body.timestamp).toBeDefined();
  });

  it('should return fallback message for RuntimeException with httpStatus 500 and no safeMessage', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-errors/runtime-500-no-safe')
      .expect(500);

    expect(response.body.statusCode).toBe(500);
    expect(response.body.errorCode).toBe('RUNTIME_500_NO_SAFE');
    expect(response.body.message).toBe(ERROR_MESSAGE_FALLBACK);
  });

  it('should return safeMessage for RuntimeException with httpStatus 400 and safeMessage', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-errors/runtime-400-with-safe')
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.errorCode).toBe('RUNTIME_400_SAFE');
    expect(response.body.message).toBe('Invalid request');
  });

  it('should return exception.message for RuntimeException with httpStatus 400 and no safeMessage', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-errors/runtime-400-no-safe')
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.errorCode).toBe('RUNTIME_400_NO_SAFE');
    expect(response.body.message).toBe('Detailed client error');
  });

  it('should default to 500 when RuntimeException has no explicit httpStatus override', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-errors/runtime-default-status')
      .expect(500);

    expect(response.body.statusCode).toBe(500);
    expect(response.body.errorCode).toBe('RUNTIME_DEFAULT');
    expect(response.body.message).toBe(ERROR_MESSAGE_FALLBACK);
  });

  it('should return empty string message for 400 when message is empty and no safeMessage', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-errors/runtime-400-no-safe-no-message')
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.errorCode).toBe('RUNTIME_400_EMPTY');
    expect(response.body.message).toBe('');
  });

  it('should handle validationErrors in context and return 400', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-errors/validation-errors')
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining(['name should not be empty']),
    );
  });

  it('should handle unknown error objects with defaults', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-errors/unknown-error')
      .expect(500);

    expect(response.body.statusCode).toBe(500);
    expect(response.body.errorCode).toBe('ERROR_CODE_UNKNOWN');
    expect(response.body.message).toBe(ERROR_MESSAGE_FALLBACK);
  });
});

describe('ExceptionsFilter with detailedErrorSerializer (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestErrorController],
    }).compile();

    app = moduleRef.createNestApplication();

    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(
      new ExceptionsFilter(httpAdapterHost, detailedErrorSerializer),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // The filter's context.validationErrors → details derivation has no
  // other observer: the default serializer never emits details, so
  // without this test the whole derivation could be deleted and the
  // suite would stay green.
  it('derives details from context.validationErrors', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-errors/validation-errors')
      .expect(400);

    expect(response.body.details).toEqual([
      { path: ['name'], message: 'name should not be empty' },
    ]);
  });

  it('keeps app-attached details over the derived ones', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-errors/validation-errors-attached')
      .expect(400);

    expect(response.body.details).toEqual([
      { path: ['name'], message: 'app-attached finding' },
    ]);
    // The message channel still flattens the validation errors.
    expect(response.body.message).toEqual(
      expect.arrayContaining(['name should not be empty']),
    );
  });

  it('masks details on a 5xx', async () => {
    const response = await request(app.getHttpServer())
      .get('/test-errors/runtime-500-with-safe')
      .expect(500);

    expect(response.body.details).toBeUndefined();
  });
});
