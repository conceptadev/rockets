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
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { Transactional } from '@concepta/nestjs-repository';
import { AuthPublic } from '@concepta/nestjs-authentication';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { getMetadataStorage, validate } from 'class-validator';

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
import {
  getStandardSchema,
  standardSchemaBadRequest,
} from '../../../common/utils/standard-schema.util';
import { getHandlerClass, isHandlerFunction } from './is-handler-class';
import { readOperationDtoOpenApiFields } from './openapi-dto-metadata';

const logger = new Logger('OperationResource');
const SWAGGER_API_SECURITY_METADATA = 'swagger/apiSecurity';

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
    value !== null && typeof value === 'object' && !Array.isArray(value)
      ? (value as object)
      : {};
  return validateAndWhitelistDto(dto, data, false);
}

/**
 * Validate declared `params` schema keys, but keep any Nest path params that
 * are not in the schema (e.g. extra `:repoId` on an operation path when the
 * resource-level schema only names base `:orgId`).
 */
async function resolveOperationParams(
  paramsDto: Type<object> | undefined,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  if (paramsDto === undefined) {
    return params;
  }
  const validated = await applyInputDto(paramsDto, params);
  if (
    validated === null ||
    typeof validated !== 'object' ||
    Array.isArray(validated)
  ) {
    return params;
  }
  return { ...params, ...(validated as Record<string, unknown>) };
}

async function validateAndWhitelistDto(
  dto: Type<object>,
  data: object,
  skipMissingProperties: boolean,
): Promise<unknown> {
  const standard = getStandardSchema(dto);
  if (standard) {
    const result = await standard['~standard'].validate(data);
    if (result.issues !== undefined) {
      throw standardSchemaBadRequest(result.issues);
    }
    return result.value ?? {};
  }

  const instance = plainToInstance(dto, data, {
    enableImplicitConversion: true,
  });
  const errors = await validate(instance as object, {
    whitelist: true,
    forbidNonWhitelisted: false,
    forbidUnknownValues: true,
    skipMissingProperties,
  });
  if (errors.length) {
    throw new BadRequestException({
      statusCode: 400,
      message: errors.flatMap((e) => Object.values(e.constraints ?? {})),
      error: 'Bad Request',
    });
  }
  return instanceToPlain(instance as object);
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

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw outputValidationError(label, 'handler returned a non-object value');
  }

  try {
    return await validateAndWhitelistDto(dto, value, false);
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw outputValidationError(label, error.getResponse());
    }
    throw error;
  }
}

function appendParamsOpenApiDecorators(
  decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>,
  paramsDto: Type<object> | undefined,
): void {
  if (paramsDto === undefined) {
    return;
  }
  const fields = readOperationDtoOpenApiFields(paramsDto);
  if (fields === undefined) {
    return;
  }
  for (const field of fields) {
    decorators.push(
      ApiParam({
        name: field.name,
        required: field.required,
        schema: field.schema,
      }),
    );
  }
}

function appendInputOpenApiDecorators(
  decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>,
  operation: CompiledOperationDescriptor,
): void {
  if (!operation.inputDto) {
    return;
  }
  if (operation.method === 'GET' || operation.method === 'DELETE') {
    const fields = readOperationDtoOpenApiFields(operation.inputDto);
    if (fields) {
      for (const field of fields) {
        decorators.push(
          ApiQuery({
            name: field.name,
            required: field.required,
            schema: field.schema,
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
 * Stable, globally unique identifier for one generated route.
 *
 * `controllerName + method + key` is NOT unique for configurations the
 * planner accepts: two bundles on the same base path can each declare a
 * `GET` operation keyed `action` with different explicit `path`s
 * (`one` / `two`). Both routes are legal and distinct, but they produced
 * the same operation ID and the same generated DTO names, so Swagger
 * pointed both at one component and the second schema overwrote the
 * first.
 *
 * The operation's own path is the discriminator that makes it unique —
 * the planner already rejects duplicate `METHOD + full path`. It is
 * appended only when it differs from the key, so the common case
 * (`path` defaulting to `key`) keeps its short, readable name.
 */
function operationId(
  controllerName: string,
  operation: CompiledOperationDescriptor,
): string {
  return `${controllerName}_${operation.method.toLowerCase()}_${operationDiscriminator(
    operation.key,
    operation.path,
  )}`;
}

/**
 * `key`, or `key_path-slug` when an explicit path makes two operations
 * with the same key distinct. Shared with the zod DTO namer so IDs and
 * component names stay in step.
 */
export function operationDiscriminator(key: string, path: string): string {
  const pathSlug = path.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  if (pathSlug === '' || pathSlug === key) return key;
  return `${key}_${pathSlug}`;
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
  /**
   * Local alias token per handler class this module does NOT register
   * itself (i.e. one supplied by an imported module).
   *
   * Every resolve stays `strict`. The alias is a local
   * `{ provide: alias, useExisting: HandlerClass }`, so `useExisting`
   * walks normal DI — imports honoured — while the token the route asks
   * for belongs to this module alone.
   *
   * A non-strict resolve is NOT an alternative: Nest's
   * `instanceLinksHost` returns `links[links.length - 1]` when given no
   * module id, i.e. the last module scanned app-wide with no relation to
   * the import graph. With one handler class exported by two modules,
   * both operation resources would silently share one instance.
   */
  handlerAliases: ReadonlyMap<unknown, symbol> = new Map(),
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
    assertValidatableDto(
      definition.paramsDto,
      `"${definition.path}" paramsDto`,
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
  const paramsDto = definition.paramsDto;

  @Controller(definition.path.replace(/^\//, ''))
  @ApiTags(...tags)
  class OperationResourceController {
    constructor(private readonly moduleRef: ModuleRef) {}
  }

  if (!bearerAuth) {
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
    attachOperationMethod(
      OperationResourceController,
      operation,
      uniqueName,
      paramsDto,
      bearerAuth,
      handlerAliases,
    );
  }

  return OperationResourceController;
}

function attachOperationMethod(
  controllerClass: Type<unknown>,
  operation: CompiledOperationDescriptor,
  controllerName: string,
  paramsDto: Type<object> | undefined,
  controllerBearerAuth: boolean,
  handlerAliases: ReadonlyMap<unknown, symbol>,
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
    const validatedParams = await resolveOperationParams(paramsDto, params);

    const operationRequest: OperationRequest = {
      headers: request.headers ?? {},
      params,
      query,
      raw: request,
    };

    const ctx: OperationContext<unknown, object> = {
      input,
      params: validatedParams,
      query,
      request: operationRequest,
      response: { raw: response },
      user,
    };

    let result: unknown;
    const handlerClass = getHandlerClass(operation.handler);
    if (handlerClass !== undefined) {
      const contextId = ContextIdFactory.getByRequest(request);
      // Always strict: either the class is registered here, or a local
      // alias for it is. Never a global scan.
      const token: unknown = handlerAliases.get(handlerClass) ?? handlerClass;
      const instance = await this.moduleRef.resolve<{
        handle: (ctx: OperationContext<unknown, object>) => unknown;
      }>(token as never, contextId, { strict: true });
      result = await instance.handle(ctx);
    } else if (isHandlerFunction(operation.handler)) {
      const handler: OperationHandlerFn<unknown, unknown, object> =
        operation.handler;
      result = await handler(ctx);
    } else {
      throw new Error(`operationResource: invalid handler for "${label}"`);
    }

    if (operation.outputDisabled === true) {
      return result;
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
      operationId: operationId(controllerName, operation),
    }),
  ];

  if (operation.public === true) {
    decorators.push(AuthPublic());
  } else if (controllerBearerAuth) {
    decorators.push(ApiBearerAuth());
  }
  if (operation.transactional === true) {
    decorators.push(Transactional());
  }
  if (operation.outputDto) {
    decorators.push(
      ApiResponse({ status: operation.status, type: operation.outputDto }),
    );
  } else {
    decorators.push(ApiResponse({ status: operation.status }));
  }
  appendParamsOpenApiDecorators(decorators, paramsDto);
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
  if (operation.public === true && descriptor.value !== undefined) {
    Reflect.defineMetadata(
      SWAGGER_API_SECURITY_METADATA,
      [{}],
      descriptor.value,
    );
  }
  Object.defineProperty(proto, methodName, descriptor);

  Body()(proto, methodName, 0);
  Query()(proto, methodName, 1);
  Param()(proto, methodName, 2);
  Req()(proto, methodName, 3);
  Res({ passthrough: true })(proto, methodName, 4);
  AuthUser()(proto, methodName, 5);
}
