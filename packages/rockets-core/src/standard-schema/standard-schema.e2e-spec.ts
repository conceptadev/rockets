/* eslint-disable @darraghor/nestjs-typed/api-method-should-specify-api-response -- ApiStandardSchemaResponse composes ApiResponse, which the lint rule cannot inspect. */

import {
  Body,
  Controller,
  Get,
  type INestApplication,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  DocumentBuilder,
  type OpenAPIObject,
  ApiTags,
  SwaggerModule,
} from '@nestjs/swagger';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  createStandardSchemaDto,
  createStandardSchemaResponseDto,
  StandardSchemaModule,
  StandardSchemaResponse,
} from '@concepta/rockets-core/standard-schema';
import { ApiStandardSchemaResponse } from '@concepta/rockets-core/standard-schema/swagger';
import { RocketsCoreExceptionsFilter } from '../infrastructure/filters/exceptions.filter';
import {
  detailedErrorSerializer,
  ROCKETS_ERROR_SERIALIZER_TOKEN,
} from '../infrastructure/filters/error-serializer';

let requestValidationCount = 0;
let responseValidationCount = 0;
let asyncResponseValidationCount = 0;

const CreateProductSchema = z
  .object({
    active: z.boolean().default(true),
    name: z.string().trim().min(1),
    price: z.coerce.number().nonnegative(),
  })
  .superRefine(() => {
    requestValidationCount += 1;
  });

class CreateProductDto extends createStandardSchemaDto(CreateProductSchema) {}

const ListProductsQuerySchema = z.object({
  active: z.stringbool().optional(),
});

class ListProductsQueryDto extends createStandardSchemaDto(
  ListProductsQuerySchema,
) {}

const ProductParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

class ProductParamsDto extends createStandardSchemaDto(ProductParamsSchema) {}

const ProductResponseSchema = z
  .object({
    active: z.boolean(),
    id: z.number().int().positive(),
    name: z.string(),
    price: z.number().nonnegative(),
  })
  .superRefine(() => {
    responseValidationCount += 1;
  });

class ProductResponseDto extends createStandardSchemaResponseDto(
  ProductResponseSchema,
) {}

interface AsyncResponseInput {
  readonly value: string;
}

const AsyncResponseSchema: StandardSchemaV1<
  AsyncResponseInput,
  { readonly value: number }
> = {
  '~standard': {
    async validate(value) {
      asyncResponseValidationCount += 1;

      if (
        typeof value === 'object' &&
        value !== null &&
        'value' in value &&
        typeof value.value === 'string'
      ) {
        return { value: { value: Number(value.value) } };
      }

      return { issues: [{ message: 'Expected a numeric string.' }] };
    },
    vendor: 'async-response-test',
    version: 1,
  },
};

class AsyncResponseDto extends createStandardSchemaResponseDto(
  AsyncResponseSchema,
) {}

let capturedBody: unknown;
let capturedParams: unknown;
let capturedQuery: unknown;

@ApiTags('standard-schema-products')
@Controller('standard-schema/products')
class ProductsController {
  @Post()
  @ApiStandardSchemaResponse(ProductResponseDto, {
    description: 'Product created.',
    status: 201,
  })
  create(@Body() input: CreateProductDto): ProductResponseDto {
    capturedBody = input;

    const product = {
      id: 1,
      ...input,
      internalRevision: 1,
    };

    return product;
  }

  @Post('documented')
  @ApiStandardSchemaResponse(ProductResponseDto, { status: 201 })
  createDocumented(
    @Body({ schema: CreateProductDto.schema }) input: CreateProductDto,
  ): ProductResponseDto {
    return {
      active: input.active,
      id: 2,
      name: input.name,
      price: input.price,
    };
  }

  @Get()
  @ApiStandardSchemaResponse(ProductResponseDto, {
    description: 'Products returned.',
    isArray: true,
    status: 200,
  })
  findAll(@Query() query: ListProductsQueryDto): ProductResponseDto[] {
    capturedQuery = query;

    return [
      {
        active: query.active ?? true,
        id: 1,
        name: 'Keyboard',
        price: 49.9,
      },
      {
        active: query.active ?? true,
        id: 2,
        name: 'Mouse',
        price: 19.9,
      },
    ];
  }

  @Get('broken')
  @ApiStandardSchemaResponse(ProductResponseDto, { status: 200 })
  broken(): ProductResponseDto {
    return {
      active: true,
      id: -1,
      name: 'Broken',
      price: 1,
    };
  }

  @Get('async')
  @StandardSchemaResponse(AsyncResponseDto)
  asyncResponse(): AsyncResponseDto {
    return { value: '42' };
  }

  @Get(':id')
  @ApiStandardSchemaResponse(ProductResponseDto, { status: 200 })
  findOne(@Param() params: ProductParamsDto): ProductResponseDto {
    capturedParams = params;

    return {
      active: true,
      id: params.id,
      name: 'Keyboard',
      price: 49.9,
    };
  }
}

describe('@concepta/rockets-core/standard-schema', () => {
  let app: INestApplication;
  let openApiDocument: OpenAPIObject;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [StandardSchemaModule.forRoot()],
      controllers: [ProductsController],
      providers: [
        { provide: APP_FILTER, useClass: RocketsCoreExceptionsFilter },
        {
          provide: ROCKETS_ERROR_SERIALIZER_TOKEN,
          useValue: detailedErrorSerializer,
        },
      ],
    }).compile();

    app = testingModule.createNestApplication({ logger: false });
    await app.init();
    openApiDocument = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Rockets Standard Schema test API')
        .setVersion('1')
        .build(),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    capturedBody = undefined;
    capturedParams = undefined;
    capturedQuery = undefined;
    requestValidationCount = 0;
    responseValidationCount = 0;
    asyncResponseValidationCount = 0;
  });

  it('infers a body schema and validates each boundary exactly once', async () => {
    const response = await request(app.getHttpServer())
      .post('/standard-schema/products')
      .send({
        ignored: 'strip me',
        name: '  Keyboard  ',
        price: '49.90',
      })
      .expect(201);

    expect(capturedBody).toEqual({
      active: true,
      name: 'Keyboard',
      price: 49.9,
    });
    expect(capturedBody).not.toBeInstanceOf(CreateProductDto);
    expect(response.body).toEqual({
      active: true,
      id: 1,
      name: 'Keyboard',
      price: 49.9,
    });
    expect(requestValidationCount).toBe(1);
    expect(responseValidationCount).toBe(1);
  });

  it('infers query and whole-params DTO schemas', async () => {
    const listResponse = await request(app.getHttpServer())
      .get('/standard-schema/products?active=false')
      .expect(200);

    expect(capturedQuery).toEqual({ active: false });
    expect(listResponse.body).toHaveLength(2);
    expect(responseValidationCount).toBe(2);

    const response = await request(app.getHttpServer())
      .get('/standard-schema/products/7')
      .expect(200);

    expect(capturedParams).toEqual({ id: 7 });
    expect(response.body.id).toBe(7);
  });

  it('keeps request failure status and attaches structured details', async () => {
    const invalidRequest = await request(app.getHttpServer())
      .post('/standard-schema/products')
      .send({ name: '', price: -1 })
      .expect(400);

    expect(invalidRequest.body.statusCode).toBe(400);
    expect(invalidRequest.body.details).toEqual([
      expect.objectContaining({ path: ['name'] }),
      expect.objectContaining({ path: ['price'] }),
    ]);
    await request(app.getHttpServer())
      .get('/standard-schema/products/broken')
      .expect(500);
  });

  it('awaits asynchronous non-Zod response schemas', async () => {
    const response = await request(app.getHttpServer())
      .get('/standard-schema/products/async')
      .expect(200);

    expect(response.body).toEqual({ value: 42 });
    expect(asyncResponseValidationCount).toBe(1);
  });

  it('publishes explicit request and composite response schemas to OpenAPI', () => {
    expect(
      openApiDocument.paths['/standard-schema/products/documented']?.post,
    ).toMatchObject({
      requestBody: {
        content: {
          'application/json': {
            schema: {
              properties: {
                active: { default: true, type: 'boolean' },
                name: { minLength: 1, type: 'string' },
                price: { minimum: 0, type: 'number' },
              },
              required: ['name', 'price'],
              type: 'object',
            },
          },
        },
      },
      responses: {
        201: {
          content: {
            'application/json': {
              schema: {
                properties: {
                  active: { type: 'boolean' },
                  id: { minimum: 0, type: 'integer' },
                  name: { type: 'string' },
                  price: { minimum: 0, type: 'number' },
                },
                required: ['active', 'id', 'name', 'price'],
                type: 'object',
              },
            },
          },
        },
      },
    });
    expect(
      openApiDocument.paths['/standard-schema/products']?.get?.responses?.[
        '200'
      ],
    ).toMatchObject({
      content: {
        'application/json': {
          schema: {
            items: { type: 'object' },
            type: 'array',
          },
        },
      },
      description: 'Products returned.',
    });
  });
});
