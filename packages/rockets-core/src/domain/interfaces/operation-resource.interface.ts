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
 * `P` is the path-param map (typed from base + operation path when using the
 * zod `operations` callback). Repositories / clients / services are not
 * injected here in v1 — register them as providers on the resource and inject
 * them into a handler class, or close over module-scoped services from a
 * function handler.
 */
export interface OperationContext<
  I = unknown,
  P extends object = Record<string, string>,
> {
  readonly input: I;
  readonly params: Readonly<P>;
  readonly query: Readonly<Record<string, unknown>>;
  readonly request: OperationRequest;
  readonly response: OperationResponse;
  readonly user: AuthorizedUser | undefined;
}

export interface OperationHandler<
  I = unknown,
  O = unknown,
  P extends object = Record<string, string>,
> {
  handle(ctx: OperationContext<I, P>): Promise<O> | O;
}

export interface OperationHandlerClassRef<
  I = unknown,
  O = unknown,
  P extends object = Record<string, string>,
> {
  readonly useClass: Type<OperationHandler<I, O, P>>;
}

export type OperationHandlerFn<
  I = unknown,
  O = unknown,
  P extends object = Record<string, string>,
> = (ctx: OperationContext<I, P>) => Promise<O> | O;

export type OperationHandlerRef<
  I = unknown,
  O = unknown,
  P extends object = Record<string, string>,
> =
  | OperationHandlerFn<I, O, P>
  | Type<OperationHandler<I, O, P>>
  | OperationHandlerClassRef<I, O, P>;

/**
 * Compiled operation descriptor — DTO classes already resolved.
 * HTTP method is the source of truth for input sourcing (GET/DELETE → query,
 * POST/PUT/PATCH → body). There is no separate `kind` field.
 *
 * Response contract: `output` is either the DTO to whitelist and
 * document against, or `false` to opt out explicitly. It is required, so
 * a response cannot silently leak by omission.
 */
export interface CompiledOperationDescriptor {
  readonly key: string;
  readonly method: OperationHttpMethod;
  readonly path: string;
  readonly status: number;
  readonly summary?: string;
  readonly public?: boolean;
  readonly transactional?: boolean;
  readonly inputDto?: Type<object>;
  /**
   * Response contract: the DTO to whitelist and document against, or
   * `false` to opt out explicitly.
   *
   * One field, because it is one decision. Modelling it as an optional
   * DTO plus an optional `disabled` flag permits two states that mean
   * nothing — both set, and neither set — which then have to be rejected
   * at definition time. Required and closed, those states cannot be
   * written, so there is nothing to reject. Mirrors the authoring layer,
   * where `output` has always been `schema | false`.
   */
  readonly output: Type<object> | false;
  readonly handler: OperationHandlerRef;
  readonly decorators?: readonly MethodDecorator[];
}

export interface OperationResourceDefinition {
  readonly path: string;
  readonly tags?: readonly string[];
  readonly public?: boolean;
  /**
   * Optional compiled DTO for path params (from zod `params` on
   * `operationResource`). Validated at request time → 400 on failure.
   */
  readonly paramsDto?: Type<object>;
  readonly operations: Readonly<Record<string, CompiledOperationDescriptor>>;
  readonly imports?: NonNullable<DynamicModule['imports']>;
  readonly providers?: ReadonlyArray<Provider>;
  readonly exports?: NonNullable<DynamicModule['exports']>;
  readonly decorators?: readonly ClassDecorator[];
}

/**
 * Planner-facing operation resource. Non-generic so it sits in `resources[]`
 * beside CRUD/module/sub without forcing type params through the union.
 * The zod layer returns a narrowed subtype that preserves the operation record.
 */
export interface OperationResource {
  readonly kind: ResourceKind.Operation;
  readonly definition: OperationResourceDefinition;
  readonly controller: Type<unknown>;
  readonly providers: ReadonlyArray<Provider>;
  readonly imports?: NonNullable<DynamicModule['imports']>;
  readonly exports?: NonNullable<DynamicModule['exports']>;
}
