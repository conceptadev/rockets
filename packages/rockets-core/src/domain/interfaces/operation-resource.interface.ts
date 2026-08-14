import type { DynamicModule, Provider, Type } from '@nestjs/common';

import type { AuthorizedUser } from './auth-user.interface';
import type { ResourceKind } from './resource-kind.enum';

/** HTTP methods supported by operation resources (v1). */
export type OperationHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Transport-agnostic façade of the incoming request handed to an operation
 * handler. Core intentionally does NOT expose the native Express/Fastify
 * request as part of the public contract — that would couple core to a
 * specific HTTP server (same rule as `AuthRequest`). Use `raw` only when you
 * genuinely need adapter-specific access.
 */
export interface OperationRequest {
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
  readonly params: Readonly<Record<string, string>>;
  readonly query: Readonly<Record<string, unknown>>;
  /** Native request object. Escape hatch — prefer the typed fields above. */
  readonly raw: unknown;
}

/**
 * Transport-agnostic façade of the outgoing response. `raw` is the native
 * response object (escape hatch); handlers normally just return a value and
 * let the framework serialise it.
 */
export interface OperationResponse {
  /** Native response object. Escape hatch for headers / status / streaming. */
  readonly raw: unknown;
}

/**
 * Runtime context passed to an operation handler.
 *
 * Repositories / clients / services are not injected here in v1 — register
 * them as providers on the resource and inject them into a handler class, or
 * close over module-scoped services from a function handler.
 */
export interface OperationContext<I = unknown> {
  readonly input: I;
  readonly params: Readonly<Record<string, string>>;
  readonly query: Readonly<Record<string, unknown>>;
  readonly request: OperationRequest;
  readonly response: OperationResponse;
  readonly user: AuthorizedUser | undefined;
}

export interface OperationHandler<I = unknown, O = unknown> {
  handle(ctx: OperationContext<I>): Promise<O> | O;
}

export type OperationHandlerFn<I = unknown, O = unknown> = (
  ctx: OperationContext<I>,
) => Promise<O> | O;

export type OperationHandlerRef<I = unknown, O = unknown> =
  | OperationHandlerFn<I, O>
  | Type<OperationHandler<I, O>>;

/**
 * Compiled operation descriptor — DTO classes already resolved.
 * Produced by {@link defineOperationResource} / zod `query`/`command`.
 */
export interface CompiledOperationDescriptor {
  readonly key: string;
  readonly kind: 'query' | 'command';
  readonly method: OperationHttpMethod;
  readonly path: string;
  readonly status: number;
  readonly summary?: string;
  readonly public?: boolean;
  readonly transactional?: boolean;
  readonly inputDto?: Type<object>;
  readonly outputDto?: Type<object>;
  readonly handler: OperationHandlerRef;
  readonly decorators?: readonly MethodDecorator[];
}

export interface OperationResourceDefinition {
  readonly path: string;
  readonly tags?: readonly string[];
  readonly public?: boolean;
  readonly operations: Readonly<Record<string, CompiledOperationDescriptor>>;
  readonly imports?: NonNullable<DynamicModule['imports']>;
  readonly providers?: ReadonlyArray<Provider>;
  readonly exports?: NonNullable<DynamicModule['exports']>;
  readonly decorators?: readonly ClassDecorator[];
}

export interface OperationResource {
  readonly kind: ResourceKind.Operation;
  readonly definition: OperationResourceDefinition;
  readonly controller: Type<unknown>;
  readonly providers: ReadonlyArray<Provider>;
  readonly imports?: NonNullable<DynamicModule['imports']>;
  readonly exports?: NonNullable<DynamicModule['exports']>;
}
