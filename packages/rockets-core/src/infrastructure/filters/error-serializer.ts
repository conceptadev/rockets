import type { HttpException } from '@nestjs/common';
import type { ExceptionInterface } from '@concepta/nestjs-core';

/**
 * DI token for a {@link RocketsErrorSerializerInterface}.
 *
 * Only needed when the filter is registered through Nest
 * (`{ provide: APP_FILTER, useClass: RocketsCoreExceptionsFilter }`).
 * Apps that construct the filter themselves in `main.ts` — the pattern
 * both sample servers use — pass the serializer as the second
 * constructor argument instead.
 */
export const ROCKETS_ERROR_SERIALIZER_TOKEN = Symbol(
  'ROCKETS_ERROR_SERIALIZER_TOKEN',
);

/**
 * Everything `RocketsCoreExceptionsFilter` resolved before writing the
 * response, handed to the serializer so an app can shape the envelope
 * without re-implementing the unwrap chain.
 *
 * The status code is NOT part of what a serializer decides: it is the
 * result of the domain-exception → 4xx mapping and the
 * `context.originalError` unwrap, which is the property apps most often
 * broke by forking the filter (miss the chain and every hook `409`
 * becomes a `500`). Shape the body freely; the status stays authoritative.
 */
export interface RocketsErrorContext {
  /** HTTP status the filter will reply with. */
  readonly statusCode: number;
  /** Stable machine-readable code (`mapHttpStatus` or `errorCode`). */
  readonly errorCode: string;
  /**
   * Client-safe message. A `string` normally; a `string[]` for flattened
   * validation errors; whatever the `HttpException` response carried
   * when it was neither.
   */
  readonly message: unknown;
  /**
   * The exception the fields above were derived from — the unwrapped one
   * when the chain yielded an inner `HttpException` / 4xx
   * `RuntimeException`, otherwise the exception as thrown.
   */
  readonly exception: ExceptionInterface | HttpException;
  /**
   * The exception as thrown, before any unwrapping. `unknown` because
   * Nest hands the filter whatever was raised — a Rockets
   * `RuntimeException`, a Nest `HttpException`, or a bare `Error` from
   * third-party code. Narrow it before reading anything off it.
   */
  readonly originalException: unknown;
}

/**
 * Strategy for turning a resolved error into the response body.
 *
 * @example
 * ```ts
 * class MyEnvelope implements RocketsErrorSerializerInterface {
 *   serialize({ statusCode, errorCode, message }: RocketsErrorContext) {
 *     return { error: { code: errorCode, detail: message }, status: statusCode };
 *   }
 * }
 *
 * app.useGlobalFilters(
 *   new RocketsCoreExceptionsFilter(httpAdapterHost, new MyEnvelope()),
 * );
 * ```
 */
export interface RocketsErrorSerializerInterface {
  serialize(context: RocketsErrorContext): unknown;
}

/**
 * The envelope Rockets has always produced. Kept as the default so
 * existing apps see no change, and exported so a custom serializer can
 * extend it (`{ ...defaultErrorSerializer.serialize(ctx), traceId }`)
 * instead of restating the four keys.
 */
export const defaultErrorSerializer: RocketsErrorSerializerInterface = {
  serialize({ statusCode, errorCode, message }: RocketsErrorContext): unknown {
    return {
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
    };
  },
};
