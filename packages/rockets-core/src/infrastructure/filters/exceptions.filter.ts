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
  Logger,
} from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { HttpAdapterHost } from '@nestjs/core';

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

@Catch()
export class RocketsCoreExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(RocketsCoreExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(rawException: ExceptionInterface, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // Unwrap nested `context.originalError` chains. Repository / CRUD
    // adapters wrap underlying errors as `ModelQueryException` →
    // `CrudQueryException`. When the deepest cause is an `HttpException`
    // (raised by a hook or deeper layer to express an authorization or
    // validation failure), surface that exception directly so the client
    // sees the intended status (401/403/400) instead of an opaque 500.
    //
    // NOTE: in upstream `@concepta/nestjs-common@8.0.0-alpha.4`, the
    // descendants of `RuntimeException` lose `context.originalError`
    // when their constructors do `Object.assign({}, super.context, …)`
    // (`super.context` resolves on the prototype, not on `this`). For
    // pre-handler validation that must surface as 4xx, prefer a NestJS
    // Guard or Pipe over a `Before*` repo hook so the `HttpException`
    // never enters the wrapping pipeline in the first place.
    const unwrapped =
      this.unwrapToHttpException(rawException) ??
      this.unwrapToClientRuntimeException(rawException);
    const exception: ExceptionInterface | HttpException =
      unwrapped ?? rawException;

    let errorCode = 'ERROR_CODE_UNKNOWN';
    let statusCode = 500;
    let message: unknown = ERROR_MESSAGE_FALLBACK;

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
      this.logger.error('Unhandled 5xx', e.stack ?? String(exception));
      const orig = e.context?.originalError;
      if (orig) {
        this.logger.error(
          'Unhandled 5xx originalError',
          (orig as { stack?: string }).stack ?? String(orig),
        );
      }
    }

    const responseBody = {
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
    };

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
  private unwrapToHttpException(exception: unknown): HttpException | undefined {
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
  private unwrapToClientRuntimeException(
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
