/* eslint-disable no-restricted-syntax --
 * Generated Nest controller for operationResource (issue #43). Core owns the
 * declarative resource compiler; the emitted @Controller is the Nest adapter
 * for that declaration, not an app-owned HTTP gateway. See CONFIGURATION.md §6a.
 * Scoped disable keeps no-restricted-imports (cycle guard) active for this file.
 */
/* eslint-disable @darraghor/nestjs-typed/controllers-should-supply-api-tags --
 * ApiTags is applied immediately below from definition.tags (with a default).
 */
import {
  applyDecorators,
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Transactional } from '@concepta/nestjs-repository';
import { AuthPublic } from '@concepta/nestjs-authentication';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { getMetadataStorage } from 'class-validator';

import { AuthUser } from '../../../common/auth/auth-user.decorator';
import type { AuthorizedUser } from '../../../domain/interfaces/auth-user.interface';
import type {
  CompiledOperationDescriptor,
  OperationContext,
  OperationHandlerFn,
  OperationHttpMethod,
  OperationRequest,
  OperationResourceDefinition,
} from '../../../domain/interfaces/operation-resource.interface';
import { whitelistedFromDto } from '../../../common/utils/whitelisted-from-dto.util';
import { getStandardSchema } from '../../../common/utils/standard-schema.util';
import { isHandlerClass } from './is-handler-class';

const logger = new Logger('OperationResource');

/** Structural view of the native request — avoids coupling core to Express. */
interface NativeRequest {
  readonly headers?: Readonly<Record<string, string | string[] | undefined>>;
}

const METHOD_DECORATOR: Record<
  OperationHttpMethod,
  (path?: string | string[]) => MethodDecorator
> = {
  GET: Get,
  POST: Post,
  PUT: Put,
  PATCH: Patch,
  DELETE: Delete,
};

function outputValidationError(
  label: string,
  detail: unknown,
): InternalServerErrorException {
  logger.error(
    `Operation "${label}" returned a value that failed outputDto validation`,
    detail === undefined ? undefined : JSON.stringify(detail),
  );
  return new InternalServerErrorException({
    statusCode: 500,
    message:
      'Operation handler returned a value that failed outputDto validation',
    error: 'Internal Server Error',
  });
}

function assertValidatableDto(
  dto: Type<object> | undefined,
  label: string,
): void {
  if (dto === undefined) {
    return;
  }
  if (getStandardSchema(dto)) {
    return;
  }
  const metas = getMetadataStorage().getTargetValidationMetadatas(
    dto,
    '',
    false,
    false,
  );
  if (metas.length === 0) {
    throw new Error(
      `operationResource ${label}: DTO "${dto.name}" has neither a Standard ` +
        `Schema nor class-validator metadata — cannot validate or whitelist. ` +
        `Pass a zod-compiled DTO (compileDtoClass) or a class-validator DTO.`,
    );
  }
}

async function applyInputDto(
  dto: Type<object> | undefined,
  value: unknown,
): Promise<unknown> {
  if (dto === undefined) {
    return value;
  }
  const data =
    value !== null && typeof value === 'object' ? (value as object) : {};
  return whitelistedFromDto(dto, data);
}

/**
 * Whitelist / validate handler output. Failures are server bugs → 500,
 * never 400 (clients did not send the response body). The failing issues
 * are logged server-side; the client response stays generic.
 */
async function applyOutputDto(
  dto: Type<object> | undefined,
  value: unknown,
  label: string,
): Promise<unknown> {
  if (dto === undefined) {
    return value;
  }
  if (value === null || value === undefined) {
    throw outputValidationError(label, `handler returned ${String(value)}`);
  }

  const standard = getStandardSchema(dto);
  if (standard) {
    const result = await standard['~standard'].validate(value);
    if (result.issues !== undefined) {
      throw outputValidationError(label, result.issues);
    }
    return result.value ?? value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  try {
    return await whitelistedFromDto(dto, value as object);
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw outputValidationError(label, error.getResponse());
    }
    throw error;
  }
}

type ZodShapeField = {
  readonly isOptional?: () => boolean;
  readonly def?: { readonly type?: string };
};

function readZodObjectShape(
  dto: Type<object>,
): Readonly<Record<string, ZodShapeField>> | undefined {
  const schema = (dto as { schema?: { shape?: Record<string, ZodShapeField> } })
    .schema;
  if (schema?.shape === undefined || typeof schema.shape !== 'object') {
    return undefined;
  }
  return schema.shape;
}

function isOptionalZodField(field: ZodShapeField): boolean {
  if (typeof field.isOptional === 'function') {
    return field.isOptional();
  }
  return field.def?.type === 'optional' || field.def?.type === 'default';
}

function appendInputOpenApiDecorators(
  decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>,
  operation: CompiledOperationDescriptor,
): void {
  if (!operation.inputDto) {
    return;
  }
  if (operation.method === 'GET' || operation.method === 'DELETE') {
    const shape = readZodObjectShape(operation.inputDto);
    if (shape) {
      for (const [name, field] of Object.entries(shape)) {
        decorators.push(
          ApiQuery({
            name,
            required: !isOptionalZodField(field),
            // Query string values are strings; use z.coerce.* in the schema.
            schema: { type: 'string' },
          }),
        );
      }
      return;
    }
    decorators.push(
      ApiQuery({
        type: operation.inputDto,
        style: 'deepObject',
        explode: true,
        required: false,
      }),
    );
    return;
  }
  decorators.push(ApiBody({ type: operation.inputDto }));
}

function controllerClassName(path: string): string {
  const slug = path.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  return `OperationResource_${slug || 'root'}`;
}

/**
 * Generate a Nest controller class from an operation-resource definition.
 *
 * Note: Nest method decorators write metadata onto the property descriptor
 * returned by `Object.getOwnPropertyDescriptor`. Descriptor write-back into
 * the prototype is intentional for generated controllers (same pattern as
 * Nest's own decorator application).
 */
export function buildOperationController(
  definition: OperationResourceDefinition,
): Type<unknown> {
  if (definition.public === true) {
    for (const operation of Object.values(definition.operations)) {
      if (operation.public === false) {
        throw new Error(
          `operationResource "${definition.path}": operation "${operation.key}" ` +
            `sets public: false but the resource is public — an op cannot be ` +
            `more private than its controller. Move the resource off public ` +
            `and mark individual ops public instead.`,
        );
      }
    }
  }

  const routeKeys = new Set<string>();
  for (const operation of Object.values(definition.operations)) {
    assertValidatableDto(
      operation.inputDto,
      `"${definition.path}" op "${operation.key}" inputDto`,
    );
    assertValidatableDto(
      operation.outputDto,
      `"${definition.path}" op "${operation.key}" outputDto`,
    );
    const routeKey = `${operation.method}:${operation.path}`;
    if (routeKeys.has(routeKey)) {
      throw new Error(
        `operationResource "${definition.path}": duplicate route ` +
          `${operation.method} "${operation.path}" (operation "${operation.key}")`,
      );
    }
    routeKeys.add(routeKey);
  }

  const bearerAuth = definition.public !== true;
  const tags =
    definition.tags && definition.tags.length > 0
      ? [...definition.tags]
      : ['operations'];
  const operations = Object.values(definition.operations);
  const uniqueName = controllerClassName(definition.path);

  @Controller(definition.path.replace(/^\//, ''))
  @ApiTags(...tags)
  class OperationResourceController {
    constructor(private readonly moduleRef: ModuleRef) {}
  }

  if (bearerAuth) {
    ApiBearerAuth()(OperationResourceController);
  } else {
    AuthPublic({ classLevel: true })(OperationResourceController);
  }
  if (definition.decorators?.length) {
    for (const decorator of definition.decorators) {
      decorator(OperationResourceController);
    }
  }

  Object.defineProperty(OperationResourceController, 'name', {
    value: uniqueName,
  });

  for (const operation of operations) {
    attachOperationMethod(OperationResourceController, operation, uniqueName);
  }

  return OperationResourceController;
}

function attachOperationMethod(
  controllerClass: Type<unknown>,
  operation: CompiledOperationDescriptor,
  controllerName: string,
): void {
  const methodName = operation.key;
  const http = METHOD_DECORATOR[operation.method];

  const label = `${controllerName}.${methodName}`;

  async function routeHandler(
    this: { moduleRef: ModuleRef },
    body: unknown,
    query: Record<string, unknown>,
    params: Record<string, string>,
    request: NativeRequest,
    response: unknown,
    user: AuthorizedUser | undefined,
  ): Promise<unknown> {
    const rawInput =
      operation.method === 'GET' || operation.method === 'DELETE'
        ? query
        : body;
    const input = await applyInputDto(operation.inputDto, rawInput);

    const operationRequest: OperationRequest = {
      headers: request.headers ?? {},
      params,
      query,
      raw: request,
    };

    const ctx: OperationContext = {
      input,
      params,
      query,
      request: operationRequest,
      response: { raw: response },
      user,
    };

    let result: unknown;
    if (isHandlerClass(operation.handler)) {
      const instance = this.moduleRef.get(operation.handler, {
        strict: false,
      });
      result = await instance.handle(ctx);
    } else {
      const handler: OperationHandlerFn = operation.handler;
      result = await handler(ctx);
    }

    return applyOutputDto(operation.outputDto, result, label);
  }

  Object.defineProperty(routeHandler, 'name', { value: methodName });

  const proto = controllerClass.prototype as Record<string, unknown>;
  proto[methodName] = routeHandler;

  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [
    http(operation.path),
    HttpCode(operation.status),
    ApiOperation({
      summary: operation.summary ?? methodName,
      operationId: `${controllerName}_${methodName}`,
    }),
  ];

  if (operation.public === true) {
    decorators.push(AuthPublic());
  }
  if (operation.transactional === true) {
    decorators.push(Transactional());
  }
  if (operation.outputDto) {
    decorators.push(
      operation.status === 201
        ? ApiCreatedResponse({ type: operation.outputDto })
        : ApiOkResponse({ type: operation.outputDto }),
    );
  }
  appendInputOpenApiDecorators(decorators, operation);
  if (operation.decorators?.length) {
    decorators.push(...operation.decorators);
  }

  const descriptor = Object.getOwnPropertyDescriptor(proto, methodName);
  if (descriptor === undefined) {
    throw new Error(
      `operationResource: missing method descriptor for "${methodName}"`,
    );
  }
  applyDecorators(...decorators)(proto, methodName, descriptor);
  Object.defineProperty(proto, methodName, descriptor);

  Body()(proto, methodName, 0);
  Query()(proto, methodName, 1);
  Param()(proto, methodName, 2);
  Req()(proto, methodName, 3);
  Res({ passthrough: true })(proto, methodName, 4);
  AuthUser()(proto, methodName, 5);
}
