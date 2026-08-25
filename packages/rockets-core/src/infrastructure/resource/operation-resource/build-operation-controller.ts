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
  attachErrorDetails,
  classValidatorErrorsToDetails,
} from '../../../common/utils/validation-error-details.util';
import {
  AccessControlGrant,
  AccessControlQuery,
} from '@concepta/nestjs-access-control';
import { inspect } from 'node:util';
import {
  applyDecorators,
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  RequestMethod,
  Res,
  Sse,
  Type,
} from '@nestjs/common';
import {
  INTERCEPTORS_METADATA,
  METHOD_METADATA,
  SSE_METADATA,
} from '@nestjs/common/constants';
import { RuntimeException } from '@concepta/nestjs-core';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import {
  Transactional,
  TransactionInterceptor,
} from '@concepta/nestjs-repository';
import { catchError, isObservable, throwError, type Observable } from 'rxjs';
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
  getCarriedStandardSchema,
  standardSchemaBadRequest,
} from '../../../common/utils/standard-schema.util';
import { ERROR_MESSAGE_FALLBACK } from '../../filters/exceptions.filter';
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
    `Operation "${label}" returned a value that failed output validation`,
    detail === undefined ? undefined : JSON.stringify(detail),
  );
  return new InternalServerErrorException({
    statusCode: 500,
    message: 'Operation handler returned a value that failed output validation',
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
  if (getCarriedStandardSchema(dto)) {
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

/**
 * Validates the request payload against the declared input DTO.
 *
 * A non-record payload is REJECTED rather than coerced. Coercing it to
 * `{}` made `POST []` against `z.object({ note: z.string().optional() })`
 * return 200 with an empty input — zod itself rejects the array, and the
 * same coercion let any array or scalar pass an all-optional
 * class-validator DTO. Silently substituting a valid value for an
 * invalid one is the failure shape to avoid on a validation boundary.
 *
 * A MISSING body still becomes `{}`: `POST` with no payload against an
 * all-optional DTO is legal, and a DTO with required fields still fails
 * validation one line later, with the field-level message rather than a
 * generic shape error.
 */
async function applyInputDto(
  dto: Type<object> | undefined,
  value: unknown,
): Promise<unknown> {
  if (dto === undefined) {
    return value;
  }
  if (value === undefined) {
    return validateAndWhitelistDto(dto, {}, false);
  }
  if (!isPlainRecord(value)) {
    const message = `Expected a JSON object body, received ${describePayload(
      value,
    )}`;
    // Same details channel as every other 400 this file mints — a
    // whole-body failure addresses the root, so the path is empty.
    throw attachErrorDetails(
      new BadRequestException({
        statusCode: 400,
        message,
        error: 'Bad Request',
      }),
      [{ path: [], message }],
    );
  }
  return validateAndWhitelistDto(dto, value, false);
}

/**
 * Whether a value is a plain JSON object.
 *
 * Prototype-checked rather than `typeof value === 'object'`. A `Buffer`
 * from a raw body parser is an object and is not an array, so the looser
 * test let it through to be whitelisted down to `{}` — the same silent
 * substitution the array case is rejected for. `Date`, `Map` and class
 * instances fall out for the same reason; none of them survive a JSON
 * round trip, so nothing a JSON client can send is lost.
 */
function isPlainRecord(value: unknown): value is object {
  if (value === null || typeof value !== 'object') return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function describePayload(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'an array';
  if (typeof value === 'object') {
    const name: unknown = value.constructor?.name;
    return typeof name === 'string' ? `a ${name}` : 'a non-plain object';
  }
  return `a ${typeof value}`;
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

/**
 * Message-shaped view of the SHARED recursive producer — one walker of
 * the class-validator error tree, not two. `classValidatorErrorsToDetails`
 * (issue #55) is the single implementation; this maps its structured
 * details to the flattened strings this 400 body has always carried.
 */
function flattenConstraintMessages(
  details: ReturnType<typeof classValidatorErrorsToDetails>,
): string[] {
  return details.map((detail) =>
    detail.path.length > 1
      ? `${detail.path.join('.')}: ${detail.message}`
      : detail.message,
  );
}

async function validateAndWhitelistDto(
  dto: Type<object>,
  data: object,
  skipMissingProperties: boolean,
): Promise<unknown> {
  const standard = getCarriedStandardSchema(dto);
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
    const details = classValidatorErrorsToDetails(errors);
    throw attachErrorDetails(
      new BadRequestException({
        statusCode: 400,
        // Recursive: a @ValidateNested failure carries its constraints in
        // `children`, not on the root — flattening only the top level
        // produced a 400 with `message: []`, telling the client nothing.
        message: flattenConstraintMessages(details),
        error: 'Bad Request',
      }),
      details,
    );
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

  const standard = getCarriedStandardSchema(dto);
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

/**
 * Wrap an SSE handler's stream so a MID-STREAM failure is masked the
 * same way {@link RocketsCoreExceptionsFilter} masks a 5xx JSON body.
 *
 * SSE errors never reach that filter — that is the root cause, not an
 * oversight. Once the first event is written the headers are committed,
 * so Nest's own SSE response controller can no longer turn a failure
 * into a status code; it writes `{ type: 'error', data: err.message }`
 * straight onto the open connection (see `router-response-controller`'s
 * `catchError`, which rethrows only while `!stream.headersCommitted`).
 * The raw message of whatever the handler threw — a driver error naming
 * a host, a connection string, an internal id — therefore reached the
 * client, and `public: true` SSE is a first-class documented pattern, so
 * that client can be anonymous.
 *
 * Masking happens in the handler, BEFORE Nest sees the error, so it
 * covers both sides of that commit boundary: pre-commit the replacement
 * is still an `HttpException` and the filter renders it with the right
 * status; post-commit its `.message` is what lands on the wire.
 */
function maskSseStreamErrors(
  result: unknown,
  label: string,
): Observable<unknown> {
  if (!isObservable(result)) {
    // Nest would reject this too (`assertObservable`), but with a bare
    // `ReferenceError` after the route has already been entered. Failing
    // here keeps it a normal 500 through the exceptions filter.
    throw outputValidationError(
      label,
      'SSE handler did not return an Observable',
    );
  }
  return result.pipe(
    catchError((error: unknown) =>
      throwError(() => toClientSafeStreamError(error, label)),
    ),
  );
}

/**
 * The SAME safe/unsafe decision {@link RocketsCoreExceptionsFilter}
 * makes, restated on the streaming path because that path cannot reach
 * the filter:
 *
 * - `HttpException` — the body is author-chosen and the filter puts it
 *   on the wire at ANY status, so the stream may too. Passed through
 *   untouched, which also preserves its status for the pre-commit case.
 * - `RuntimeException` — `safeMessage` is the author's opt-in
 *   client-visible text. At 5xx it is the ONLY thing allowed out
 *   (`safeMessage ?? ERROR_MESSAGE_FALLBACK`), exactly as in the filter.
 * - anything else (a plain `Error`, a driver failure) — a 500 with no
 *   declared safe text. The filter would send `ERROR_MESSAGE_FALLBACK`;
 *   so does this. The real error is logged server-side instead.
 */
function toClientSafeStreamError(error: unknown, label: string): unknown {
  if (error instanceof HttpException) {
    return error;
  }
  if (error instanceof RuntimeException) {
    const status = error.httpStatus ?? 500;
    if (status < 500) {
      return new HttpException(error.safeMessage ?? error.message, status);
    }
    logStreamFailure(label, error);
    return new HttpException(
      error.safeMessage ?? ERROR_MESSAGE_FALLBACK,
      status,
    );
  }
  logStreamFailure(label, error);
  return new InternalServerErrorException(ERROR_MESSAGE_FALLBACK);
}

function logStreamFailure(label: string, error: unknown): void {
  // Same channel and same reasoning as the filter's 'Unhandled 5xx':
  // through Nest's Logger, at every 5xx, with `inspect` so a stack-less
  // non-Error does not log as '[object Object]'.
  logger.error(
    `SSE operation "${label}" stream errored`,
    error instanceof Error ? error.stack ?? error.message : inspect(error),
  );
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
 * Base name for an operation's generated request/response DTO classes,
 * which become OpenAPI component names.
 *
 * Shared with the planner so the uniqueness assertion checks the SAME
 * string the zod compiler stamps. Two namers drifting apart is what let
 * `foo-bar` and `fooBar` get distinct operation ids and one component
 * name: the ids keyed off an underscore slug, the DTOs off a pascal
 * transform that folds both spellings together.
 *
 * `pascal` stays lossy on purpose. Making it injective would be a guess
 * about which characters matter; asserting the result is unique is
 * total. Same reasoning as `validateOperationIdUniqueness` — the
 * transform is a readability optimisation, never the thing correctness
 * rests on.
 */
export function operationDtoBaseName(args: {
  readonly resourcePath: string;
  readonly method: string;
  readonly key: string;
  readonly path: string;
}): string {
  return `${pascalSegment(args.resourcePath)}_${pascalSegment(
    args.method.toLowerCase(),
  )}_${pascalSegment(operationDiscriminator(args.key, args.path))}`;
}

/**
 * Marks a DTO class whose NAME Rockets minted, as opposed to one the
 * consumer supplied.
 *
 * The distinction matters for the OpenAPI component-uniqueness check:
 * a consumer may legitimately reuse one hand-written DTO across several
 * operations, so asserting global name uniqueness over every DTO would
 * reject valid apps. A generated name colliding, on the other hand, is
 * always a bug — two schemas would claim one component and the second
 * silently overwrites the first.
 *
 * `Symbol.for` so two copies of the package still recognise each
 * other's brands.
 */
export const ROCKETS_GENERATED_DTO_NAME = Symbol.for(
  '@concepta/rockets-core/generated-dto-name',
);

/**
 * Component name for a resource's shared path-params DTO. Same lossy
 * transform, same uniqueness assertion covering it.
 */
export function operationResourceParamsDtoName(resourcePath: string): string {
  return `${pascalSegment(resourcePath)}_Params`;
}

function pascalSegment(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
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
  aclDecorators: Readonly<Record<string, readonly MethodDecorator[]>> = {},
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
      operation.output === false ? undefined : operation.output,
      `"${definition.path}" op "${operation.key}" output`,
    );
    assertValidatableDto(
      definition.paramsDto,
      `"${definition.path}" paramsDto`,
    );
    // Lowercased: Express matches case-insensitively by default, so
    // two ops differing only in path casing are one wire route.
    const routeKey = `${operation.method}:${operation.path.toLowerCase()}`;
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
      aclDecorators[operation.key],
    );
  }

  return OperationResourceController;
}

/**
 * Enforce the SSE route invariants on the FINAL registered metadata,
 * after every decorator — framework and consumer — has run.
 *
 * `applyDecorators` runs its list IN ORDER, and Nest's route decorators
 * are plain `Reflect.defineMetadata` writes with no merge: last write
 * wins. `@Sse(path)` writes `METHOD_METADATA = GET` *and*
 * `SSE_METADATA = true`; a consumer's `decorators: [Post('x')]`, pushed
 * onto the end of the same array, overwrote only the first of those.
 * The result was a POST route still in SSE response mode — a state Nest
 * has no legitimate way to reach, unusable by any `EventSource`, and
 * INVISIBLE to both the duplicate-route check above and the planner's
 * cross-resource collision check, because both read `operation.method`
 * rather than what actually got registered.
 *
 * Reading the metadata back in a second pass is the same technique the
 * `acl` / hand-written `AccessControlGrant` collision check below uses,
 * for the same reason: two writers, one metadata slot, no defined
 * winner → fail at definition time rather than ship a broken route.
 * Checking the final STATE also closes the other door — a hand-crafted
 * `PendingOperation` or a `defineOperationResource` descriptor pairing
 * `method: 'POST'` with `responseMode: 'sse'` lands here too.
 */
function assertSseRouteShape(
  operation: CompiledOperationDescriptor,
  handler: object,
  label: string,
): void {
  const declaredSse = operation.responseMode === 'sse';
  const registeredSse: unknown = Reflect.getMetadata(SSE_METADATA, handler);
  const isSseRoute = registeredSse === true;

  if (isSseRoute && !declaredSse) {
    throw new Error(
      `operationResource: operation "${operation.key}" carries an @Sse() ` +
        `decorator but was not declared with \`op.sse()\` (responseMode ` +
        `"sse"). Core would still run the JSON output-DTO step over the ` +
        `handler's Observable. Use \`op.sse()\` instead of applying @Sse() ` +
        `through \`decorators\`.`,
    );
  }
  if (!declaredSse) {
    return;
  }
  if (!isSseRoute) {
    throw new Error(
      `operationResource: SSE operation "${operation.key}" lost its @Sse() ` +
        `metadata — a decorator in \`decorators\` overwrote it. The route ` +
        `would return a raw Observable as a JSON body.`,
    );
  }

  // The DECLARED method, checked separately from the registered one
  // because they are read by different consumers. `@Sse()` always
  // registers GET, so a descriptor declaring `method: 'POST'` with
  // `responseMode: 'sse'` produces a working GET route that the
  // duplicate-route check above and the planner's cross-resource
  // collision check both file under POST — a real route no route audit
  // can see. Reachable only through `defineOperationResource` or a
  // hand-built pending; `op.sse()` goes through `defaultMethod('sse')`.
  if (operation.method !== 'GET') {
    throw new Error(
      `operationResource: SSE operation "${operation.key}" declares method ` +
        `${operation.method}, but an SSE route must be GET — @Sse() always ` +
        `registers GET, so route collision checks would file this route ` +
        `under ${operation.method} while it serves GET "${operation.path}".`,
    );
  }

  const registeredMethod: unknown = Reflect.getMetadata(
    METHOD_METADATA,
    handler,
  );
  if (registeredMethod !== RequestMethod.GET) {
    throw new Error(
      `operationResource: SSE operation "${operation.key}" registers as ` +
        `method ${describeRequestMethod(registeredMethod)}, but an SSE route ` +
        `must be GET — the only method a browser's EventSource can issue. A ` +
        `route decorator in \`decorators\` (or a \`method\` on a hand-built ` +
        `operation descriptor) overwrote @Sse()'s method while leaving the ` +
        `stream response mode in place. Route collision checks still see ` +
        `GET "${operation.path}", so this would not surface anywhere else.`,
    );
  }

  if (hasTransactionInterceptor(handler)) {
    throw new Error(
      `operationResource: SSE operation "${operation.key}" combines ` +
        `\`responseMode: "sse"\` with Transactional(). The handler returns ` +
        `its Observable immediately, so the transaction the interceptor ` +
        `opens commits before a single event is emitted — a silent no-op, ` +
        `not the guarantee the decorator reads as. Open a transaction ` +
        `inside the stream (TransactionScope.run) if a specific emission ` +
        `needs one. (${label})`,
    );
  }
}

/**
 * Whether `Transactional()` reached this route.
 *
 * Detected through the interceptor CLASS it registers rather than its
 * metadata key: upstream exports `TransactionInterceptor` and
 * `Transactional`, but not the `TRANSACTIONAL_KEY` symbol the decorator
 * writes, so the class reference is the only public identity available.
 * `Transactional(false)` — the opt-OUT — registers no interceptor and is
 * correctly not flagged.
 */
function hasTransactionInterceptor(handler: object): boolean {
  const interceptors: unknown = Reflect.getMetadata(
    INTERCEPTORS_METADATA,
    handler,
  );
  if (!Array.isArray(interceptors)) {
    return false;
  }
  return interceptors.some(
    (interceptor: unknown) =>
      interceptor === TransactionInterceptor ||
      interceptor instanceof TransactionInterceptor,
  );
}

function describeRequestMethod(value: unknown): string {
  const name = Object.entries(RequestMethod).find(
    ([, enumValue]) => enumValue === value,
  )?.[0];
  return name ?? String(value);
}

function attachOperationMethod(
  controllerClass: Type<unknown>,
  operation: CompiledOperationDescriptor,
  controllerName: string,
  paramsDto: Type<object> | undefined,
  controllerBearerAuth: boolean,
  handlerAliases: ReadonlyMap<unknown, symbol>,
  aclDecorators: readonly MethodDecorator[] | undefined,
): void {
  const methodName = operation.key;
  const isSse = operation.responseMode === 'sse';
  const routeDecorator = isSse
    ? Sse(operation.path)
    : METHOD_DECORATOR[operation.method](operation.path);

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
      // Register the REQUEST under the context id before resolving:
      // this controller is statically scoped, so the request carries no
      // context id of its own and `getByRequest` mints a fresh one —
      // without registration, a handler (or any dependency in its
      // subtree) injecting `REQUEST` received `undefined` and 500'd on
      // every call, though the same class works fine as an ordinary
      // controller dependency.
      this.moduleRef.registerRequestByContextId(request, contextId);
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

    if (isSse) {
      return maskSseStreamErrors(result, label);
    }
    if (operation.output === false) {
      return result;
    }
    return applyOutputDto(operation.output, result, label);
  }

  Object.defineProperty(routeHandler, 'name', { value: methodName });

  const proto = controllerClass.prototype as Record<string, unknown>;
  proto[methodName] = routeHandler;

  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [
    routeDecorator,
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
  if (isSse) {
    // Framing (the event stream itself) is not representable in OpenAPI
    // — documented as a stated non-goal, not a silent gap.
    decorators.push(
      ApiResponse({
        status: operation.status,
        description:
          'Server-Sent Events stream (text/event-stream) — not ' +
          'represented in the OpenAPI schema.',
      }),
    );
  } else if (operation.output !== false) {
    decorators.push(
      ApiResponse({ status: operation.status, type: operation.output }),
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

  // The acl-derived grant is applied in a SECOND pass so the consumer's
  // decorators are readable in between. Upstream's grant metadata is a
  // plain SetMetadata — last write wins, no merge — so applying `acl`
  // after a hand-written AccessControlGrant silently REPLACED it: a
  // grant deliberately tighter than the inferred action was discarded,
  // and the route audit reported only the survivor. Two validators, one
  // slot, no defined winner → fail at definition time naming both.
  // (CRUD resources cannot do this — their controller is built
  // downstream of the planner — which is why their docs state the
  // limitation instead.)
  if (aclDecorators?.length && descriptor.value !== undefined) {
    // BOTH keys, not just the grant: `acl.query` pushes an
    // AccessControlQuery into the same second-pass array, and a manual
    // AccessControlQuery — a deliberately TIGHTER row filter — was
    // still silently replaced when only the grant key was read back.
    // Same defect, sibling slot.
    const grantKey = AccessControlGrant().KEY;
    const queryKey = AccessControlQuery().KEY;
    const manualGrant: unknown =
      (typeof grantKey === 'string'
        ? Reflect.getMetadata(grantKey, descriptor.value)
        : undefined) ??
      (typeof queryKey === 'string'
        ? Reflect.getMetadata(queryKey, descriptor.value)
        : undefined);
    if (manualGrant !== undefined) {
      throw new Error(
        `operationResource: operation "${operation.key}" declares \`acl\` ` +
          'AND carries a hand-written AccessControl* decorator. Grant ' +
          'metadata is last-write-wins — one would silently replace the ' +
          'other. Use `acl` (and its per-operation overrides) OR manual ' +
          'decorators on this operation, not both.',
      );
    }
    applyDecorators(...aclDecorators)(proto, methodName, descriptor);
  }
  if (operation.public === true && descriptor.value !== undefined) {
    Reflect.defineMetadata(
      SWAGGER_API_SECURITY_METADATA,
      [{}],
      descriptor.value,
    );
  }
  // LAST, after every decorator has written: the invariants below are
  // about the metadata that actually got registered, not the metadata
  // this file intended to register.
  if (descriptor.value !== undefined) {
    assertSseRouteShape(operation, descriptor.value as object, label);
  }
  Object.defineProperty(proto, methodName, descriptor);

  Body()(proto, methodName, 0);
  Query()(proto, methodName, 1);
  Param()(proto, methodName, 2);
  Req()(proto, methodName, 3);
  Res({ passthrough: true })(proto, methodName, 4);
  AuthUser()(proto, methodName, 5);
}
