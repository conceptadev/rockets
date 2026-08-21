import type { PlainLiteralObject } from '@nestjs/common';

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
   * The exception as thrown, before any unwrapping — the only thing here
   * a serializer cannot reconstruct from the resolved fields, and what a
   * correlation id or a structured log line is built from.
   *
   * `unknown` because Nest hands the filter whatever was raised: a
   * Rockets `RuntimeException`, a Nest `HttpException`, or a bare
   * `Error` from third-party code. Narrow it before reading anything off
   * it.
   *
   * NEVER spread or serialize this into the response body. The
   * documented pattern is "spread the default and add" — one careless
   * `...context` instead of `...defaultErrorSerializer.serialize(context)`
   * puts a stack trace (and whatever the exception carries) on the
   * wire. Read specific fields off it; emit none of it.
   *
   * The POST-unwrap exception is deliberately absent. Interpreting it
   * requires knowing the unwrap semantics the filter keeps to itself,
   * and everything it would be read for — status, code, message — is
   * already resolved above.
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
  /**
   * Returns the response body. An object, not `unknown`: the documented
   * pattern is to spread the default and add to it, and a spread of
   * `unknown` does not compile.
   */
  serialize(context: RocketsErrorContext): PlainLiteralObject;
}

/**
 * The envelope Rockets has always produced. Kept as the default so
 * existing apps see no change, and exported so a custom serializer can
 * extend it (`{ ...defaultErrorSerializer.serialize(ctx), traceId }`)
 * instead of restating the four keys.
 */
export const defaultErrorSerializer: RocketsErrorSerializerInterface = {
  serialize({
    statusCode,
    errorCode,
    message,
  }: RocketsErrorContext): PlainLiteralObject {
    return {
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
    };
  },
};
