import type { DynamicModule, Provider, Type } from '@nestjs/common';

import type { AuthorizedUser } from './auth-user.interface';
import type { ResourceKind } from './resource-kind.enum';
import type {
  OperationAclConfig,
  ResourceAclConfig,
  ResourceAclPlan,
} from './resource-acl.interface';

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
 * Response contract: either `outputDto` (whitelist + OpenAPI) or
 * `outputDisabled: true` (explicit opt-out). Omitting both is rejected at
 * define/boot time so responses cannot silently leak.
 */
export interface CompiledOperationDescriptor {
  readonly key: string;
  readonly method: OperationHttpMethod;
  readonly path: string;
  readonly status: number;
  readonly summary?: string;
  readonly public?: boolean;
  /**
   * Access control for this operation.
   *
   * Unlike CRUD there is no action to infer — a non-CRUD route's verb
   * says nothing about intent (`POST /pets/:id/transfer` is an update,
   * not a create). `op.read` and `op.delete` default to `read` and
   * `delete`; `op.write` has no default and MUST declare one, or opt out
   * with `false`.
   */
  readonly acl?: OperationAclConfig;
  readonly transactional?: boolean;
  readonly inputDto?: Type<object>;
  readonly outputDto?: Type<object>;
  /** Explicit opt-out of output whitelist / response OpenAPI schema. */
  readonly outputDisabled?: boolean;
  readonly handler: OperationHandlerRef;
  readonly decorators?: readonly MethodDecorator[];
}

export interface OperationResourceDefinition {
  readonly path: string;
  readonly tags?: readonly string[];
  readonly public?: boolean;
  /**
   * Access control for the generated controller. See
   * {@link ResourceAclConfig}. Required before any operation may declare
   * an `acl` action — the action needs a resource name to grant against.
   */
  readonly acl?: ResourceAclConfig;
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
  /** See {@link CrudResource.acl} — same contract, same planner. */
  readonly acl: ResourceAclPlan;
  readonly definition: OperationResourceDefinition;
  readonly controller: Type<unknown>;
  readonly providers: ReadonlyArray<Provider>;
  readonly imports?: NonNullable<DynamicModule['imports']>;
  readonly exports?: NonNullable<DynamicModule['exports']>;
}
