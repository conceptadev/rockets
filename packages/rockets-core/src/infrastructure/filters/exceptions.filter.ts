import { PlainLiteralObject } from '@nestjs/common';
import { inspect } from 'node:util';
import {
  ExceptionInterface,
  mapHttpStatus,
  RuntimeException,
} from '@concepta/nestjs-core';
import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  Inject,
  Logger,
  Optional,
} from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { HttpAdapterHost } from '@nestjs/core';
import type { OperationRequest } from '../../domain/interfaces/operation-resource.interface';
import {
  classValidatorErrorsToDetails,
  readErrorDetails,
} from '../../common/utils/validation-error-details.util';
import {
  type RocketsErrorContext,
  type RocketsErrorDetail,
  defaultErrorSerializer,
  ROCKETS_ERROR_SERIALIZER_TOKEN,
  type RocketsErrorSerializerInterface,
} from './error-serializer';

export const ERROR_MESSAGE_FALLBACK = 'Internal Server Error';

/**
 * Structural shape of a `class-validator` `ValidationError`. Declared
 * locally on purpose: the filter only reads these three fields, and
 * depending on `class-validator` types here would couple the core
 * package to a validation library it does not otherwise need.
 */
interface ValidationErrorLike {
  readonly property: string;
  readonly constraints?: Readonly<Record<string, string>>;
  readonly children?: readonly ValidationErrorLike[];
}

function isValidationErrorList(
  value: unknown,
): value is readonly ValidationErrorLike[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isObject(item) &&
        typeof (item as { property?: unknown }).property === 'string',
    )
  );
}

/**
 * Flatten nested validation errors into constraint messages, prefixing
 * child messages with the parent property (`address.street must be …`).
 *
 * Reimplemented rather than borrowed: the previous version reached into
 * `new ValidationPipe()['flattenValidationErrors']`, a PRIVATE Nest
 * method accessed by string index — invisible to the compiler and free
 * to disappear in any Nest patch release.
 */
function flattenValidationErrors(
  errors: readonly ValidationErrorLike[],
): string[] {
  const messages: string[] = [];
  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    if (error.children && error.children.length > 0) {
      for (const child of flattenValidationErrors(error.children)) {
        messages.push(`${error.property}.${child}`);
      }
    }
  }
  return messages;
}

/**
 * Global exception filter: unwraps the repository/CRUD wrapping chain so
 * a hook's `409` stays a `409`, maps domain exceptions to their HTTP
 * status, and writes the response body.
 *
 * The body SHAPE is pluggable — pass a
 * {@link RocketsErrorSerializerInterface} as the second constructor
 * argument, or provide {@link ROCKETS_ERROR_SERIALIZER_TOKEN} when the
 * filter is registered through Nest. Status resolution and the unwrap
 * chain are deliberately not pluggable: forking the whole filter to
 * change three keys is what used to cost apps that behaviour.
 */
@Catch()
export class RocketsCoreExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(RocketsCoreExceptionsFilter.name);
  private readonly serializer: RocketsErrorSerializerInterface;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Optional()
    @Inject(ROCKETS_ERROR_SERIALIZER_TOKEN)
    serializer?: RocketsErrorSerializerInterface,
  ) {
    this.serializer = serializer ?? defaultErrorSerializer;
  }

  catch(rawException: ExceptionInterface, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request: unknown = ctx.getRequest();

    // Unwrap nested `context.originalError` chains. Repository / CRUD
    // adapters wrap underlying errors as `ModelQueryException` →
    // `CrudQueryException`. When the deepest cause is an `HttpException`
    // (raised by a hook or deeper layer to express an authorization or
    // validation failure), surface that exception directly so the client
    // sees the intended status (401/403/400) instead of an opaque 500.
    //
    // Upstream RuntimeException subclasses currently lose `originalError`
    // while rebuilding their context. Guards and pipes avoid that wrapping for
    // pre-handler validation that must preserve a 4xx response.
    const unwrapped =
      this.unwrapToHttpException(rawException) ??
      this.unwrapToClientRuntimeException(rawException);
    const exception: ExceptionInterface | HttpException =
      unwrapped ?? rawException;

    let errorCode = 'ERROR_CODE_UNKNOWN';
    let statusCode = 500;
    let message: unknown = ERROR_MESSAGE_FALLBACK;
    // Read for EVERY exception type, not only HttpException: the
    // documented hook guidance is to throw RepositoryQueryException
    // with an httpStatus, and a consumer following it would otherwise
    // attach details this filter silently drops. Unwrapped first, raw
    // second, so a wrapped hook 400 keeps its findings.
    let details: readonly RocketsErrorDetail[] | undefined =
      readErrorDetails(exception) ?? readErrorDetails(rawException);

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorCode = mapHttpStatus(statusCode);

      const res = exception.getResponse();
      message = isObject(res) && 'message' in res ? res.message : res;
    } else if (exception instanceof RuntimeException) {
      errorCode = exception.errorCode;

      if (exception.httpStatus) {
        statusCode = exception.httpStatus;
      }

      if (statusCode >= 500) {
        message = exception.safeMessage ?? ERROR_MESSAGE_FALLBACK;
      } else if (exception.safeMessage) {
        message = exception.safeMessage;
      } else {
        message =
          exception.message ?? exception.safeMessage ?? ERROR_MESSAGE_FALLBACK;
      }
    }

    if (
      !(exception instanceof HttpException) &&
      isValidationErrorList(exception.context?.validationErrors)
    ) {
      message = flattenValidationErrors(exception.context.validationErrors);
      // App-attached details win: an exception can carry BOTH a symbol
      // payload (attachErrorDetails) and `context.validationErrors`, and
      // deriving over the explicit attachment would silently discard the
      // app's findings.
      details ??= classValidatorErrorsToDetails(
        exception.context.validationErrors,
      );
      statusCode = 400;
    }

    // Logged through Nest's Logger, not `console`, and at every 5xx —
    // whether the trace is printed is the consuming app's decision
    // (log levels, custom logger, transports), not this library's, and
    // it is certainly not `NODE_ENV`'s: that variable is unset in plenty
    // of production containers, which is exactly when the old
    // `!== 'production'` check leaked stack traces to stdout.
    if (statusCode >= 500) {
      const e = exception as {
        stack?: string;
        context?: { originalError?: unknown };
      };
      // `inspect` over String(): a stack-less non-Error exception would
      // otherwise log as the useless '[object Object]'.
      this.logger.error('Unhandled 5xx', e.stack ?? inspect(exception));
      const orig = e.context?.originalError;
      if (orig) {
        this.logger.error(
          'Unhandled 5xx originalError',
          (orig as { stack?: string }).stack ?? inspect(orig),
        );
      }
    }

    // Same invariant as the message masking above: a 5xx is an internal
    // failure and its content is not client-safe. `details` is a sibling
    // channel of `message` and obeys the same rule — an attached finding
    // that quotes an internal error must not ride around the mask.
    if (statusCode >= 500) {
      details = undefined;
    }

    const context: RocketsErrorContext = {
      statusCode,
      errorCode,
      message,
      originalException: rawException,
      ...(details && details.length > 0 ? { details } : {}),
      request: toErrorRequest(request),
    };
    // A serializer that THROWS is caught, not propagated: an unhandled
    // exception inside the exception filter replaces the resolved
    // status and envelope with the adapter's bare 500 — a serializer
    // bug silently rewriting every error response, routine 404s
    // included. Same rationale as the null-return fallback below.
    let serialized: PlainLiteralObject | null;
    try {
      serialized = this.serializer.serialize(context);
    } catch (serializerError) {
      this.logger.error(
        'Error serializer threw; falling back to the default envelope',
        serializerError instanceof Error
          ? serializerError.stack
          : inspect(serializerError),
      );
      serialized = null;
    }
    // A serializer that returns nothing would otherwise send an empty
    // body with a correct status — a client sees a 409 it cannot read.
    // Fall back rather than fail a second time inside the error path.
    const responseBody =
      serialized === null || serialized === undefined
        ? defaultErrorSerializer.serialize(context)
        : serialized;

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }

  /**
   * Walk the `context.originalError` chain of nested wrapped exceptions
   * and return the first `HttpException` encountered. Returns `undefined`
   * if the chain contains no `HttpException` (the original exception
   * already represents the right shape).
   *
   * NOTE: upstream `RepositoryQueryException` loses `context.originalError`
   * due to a constructor pattern bug (`Object.assign({}, super.context, …)`
   * where `super.context` evaluates to undefined for instance properties).
   * This is compensated by `defineHook` which pre-wraps `HttpException`s as
   * `RepositoryQueryException` and grafts `originalError` onto context
   * AFTER construction. Class-based hooks that cannot do this should throw
   * a `RepositoryQueryException` directly with the appropriate `httpStatus`
   * rather than throwing `HttpException` — those surface via
   * `unwrapToRuntimeException` below.
   */
  protected unwrapToHttpException(
    exception: unknown,
  ): HttpException | undefined {
    let current: unknown = exception;
    const seen = new Set<unknown>();
    while (current && !seen.has(current)) {
      seen.add(current);
      if (current instanceof HttpException) {
        return current === exception ? undefined : current;
      }
      const next = (current as { context?: { originalError?: unknown } })
        ?.context?.originalError;
      if (!next || next === current) break;
      current = next;
    }
    return undefined;
  }

  /**
   * Walk the exception chain to find the innermost `RuntimeException` with
   * a 4xx `httpStatus`. This surfaces domain exceptions thrown from
   * repository hooks that cannot propagate `HttpException` through the
   * membrane (upstream wrapping loses `originalError` — see above).
   * Returns `undefined` if no 4xx `RuntimeException` is found.
   */
  protected unwrapToClientRuntimeException(
    exception: unknown,
  ): RuntimeException | undefined {
    let current: unknown = exception;
    let candidate: RuntimeException | undefined;
    const seen = new Set<unknown>();
    while (current && !seen.has(current)) {
      seen.add(current);
      if (
        current instanceof RuntimeException &&
        current.httpStatus !== undefined &&
        current.httpStatus < 500 &&
        current !== exception
      ) {
        candidate = current;
      }
      const next = (current as { context?: { originalError?: unknown } })
        ?.context?.originalError;
      if (!next || next === current) break;
      current = next;
    }
    return candidate;
  }
}

/**
 * The request in the same transport-agnostic shape operation handlers
 * receive: typed `headers`/`params`/`query`, `raw` as the escape hatch.
 * Built defensively — the filter also fires for errors thrown before
 * routing, where params/query may not exist yet.
 */
function toErrorRequest(request: unknown): OperationRequest {
  const source: object = isObject(request) ? request : {};
  return {
    headers: recordOrEmpty(
      Reflect.get(source, 'headers'),
    ) as OperationRequest['headers'],
    params: recordOrEmpty(
      Reflect.get(source, 'params'),
    ) as OperationRequest['params'],
    query: recordOrEmpty(
      Reflect.get(source, 'query'),
    ) as OperationRequest['query'],
    raw: request,
  };
}

function recordOrEmpty(value: unknown): Record<string, unknown> {
  // `isObject` narrows only to `object`. The wider invariant the
  // callers' casts assert: on every supported adapter these maps carry
  // string keys with string / string[] values (headers, params) or
  // parsed primitives (query) — Express and Fastify both guarantee it.
  // TypeScript cannot check value types through `unknown`, so the
  // guarantee is the adapters' contract, restated here on purpose.
  return isObject(value) ? (value as Record<string, unknown>) : {};
}
