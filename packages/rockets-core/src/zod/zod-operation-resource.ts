import type { Type } from '@nestjs/common';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import type {
  CompiledOperationDescriptor,
  OperationHandlerRef,
  OperationHttpMethod,
  OperationResource,
  OperationResourceDefinition,
} from '../domain/interfaces/operation-resource.interface';
import { defineOperationResource } from '../infrastructure/resource/define-operation-resource';
import { assertValidOperationKey } from '../infrastructure/resource/operation-resource/operation-key';
import { compileDtoClass } from './zod-dto';

type InferIn<TInput> = [TInput] extends [z.ZodObject]
  ? z.output<TInput>
  : unknown;

type InferOut<TOutput> = [TOutput] extends [false]
  ? void
  : [TOutput] extends [z.ZodType]
  ? z.output<TOutput>
  : unknown;

type OperationOutputSchema = z.ZodObject | z.ZodArray;
type OperationOutputConfig = OperationOutputSchema | false;

/**
 * Extract `:param` names from a path template into a string-record type.
 * Decision (#50): keys map to path segments verbatim (no kebab-case).
 */
export type PathParams<S extends string> = string extends S
  ? Record<string, string>
  : S extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof PathParams<`/${Rest}`>]: string }
  : S extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {};

type MergeParams<A, B> = Omit<A, keyof B> & B;

type ParamsFromSchema<TParamsSchema extends z.ZodObject | undefined> = [
  TParamsSchema,
] extends [z.ZodObject]
  ? z.output<TParamsSchema>
  : {};

type EffectiveParams<
  TBase extends string,
  TOpPath extends string,
  TParamsSchema extends z.ZodObject | undefined,
> = MergeParams<
  PathParams<TBase>,
  MergeParams<PathParams<TOpPath>, ParamsFromSchema<TParamsSchema>>
>;

type ReadMethod = 'GET';
type WriteMethod = 'POST' | 'PUT' | 'PATCH';
type DeleteMethod = 'DELETE';

interface SharedBuilderFields<
  TInput extends z.ZodObject | undefined,
  TOutput extends OperationOutputConfig,
  TParams extends object,
> {
  readonly status?: number;
  readonly summary?: string;
  readonly public?: boolean;
  readonly transactional?: boolean;
  readonly input?: TInput;
  /** Required: schema to whitelist, or `false` to opt out explicitly. */
  readonly output: TOutput;
  readonly handler: OperationHandlerRef<
    InferIn<TInput>,
    InferOut<TOutput>,
    TParams
  >;
  readonly decorators?: readonly MethodDecorator[];
}

export type ReadBuilderConfig<
  TInput extends z.ZodObject | undefined = undefined,
  TOutput extends OperationOutputConfig = OperationOutputSchema,
  TParams extends object = object,
  TOpPath extends string = '',
> = SharedBuilderFields<TInput, TOutput, TParams> & {
  readonly method?: ReadMethod;
  readonly path?: TOpPath;
};

export type WriteBuilderConfig<
  TInput extends z.ZodObject | undefined = undefined,
  TOutput extends OperationOutputConfig = OperationOutputSchema,
  TParams extends object = object,
  TOpPath extends string = '',
> = SharedBuilderFields<TInput, TOutput, TParams> & {
  readonly method?: WriteMethod;
  readonly path?: TOpPath;
};

export type DeleteBuilderConfig<
  TInput extends z.ZodObject | undefined = undefined,
  TOutput extends OperationOutputConfig = OperationOutputSchema,
  TParams extends object = object,
  TOpPath extends string = '',
> = SharedBuilderFields<TInput, TOutput, TParams> & {
  readonly method?: DeleteMethod;
  readonly path?: TOpPath;
};

export type PendingBuilder = 'read' | 'write' | 'delete';

/**
 * Pending operation produced by `op.read` / `op.write` / `op.delete`.
 * Generics are preserved so `typeof resource.authored` stays informative.
 */
export interface PendingOperation<
  TInput = unknown,
  TOutput = unknown,
  TParams extends object = object,
> {
  readonly builder: PendingBuilder;
  readonly method: OperationHttpMethod;
  readonly path: string | undefined;
  readonly status: number | undefined;
  readonly summary: string | undefined;
  readonly public: boolean | undefined;
  readonly transactional: boolean | undefined;
  readonly input: z.ZodObject | undefined;
  readonly output: OperationOutputConfig;
  readonly handler: OperationHandlerRef<TInput, TOutput, TParams>;
  readonly decorators: readonly MethodDecorator[] | undefined;
}

/**
 * Heterogeneous operation map. Per-op generics live on each
 * {@link PendingOperation} value and on `authored`; the index signature uses
 * an opaque `handler` so variance does not collapse the callback return type.
 */
export type OperationRecord = {
  readonly [key: string]: {
    readonly builder: PendingBuilder;
    readonly method: OperationHttpMethod;
    readonly path: string | undefined;
    readonly status: number | undefined;
    readonly summary: string | undefined;
    readonly public: boolean | undefined;
    readonly transactional: boolean | undefined;
    readonly input: z.ZodObject | undefined;
    readonly output: OperationOutputConfig;
    readonly handler: unknown;
    readonly decorators: readonly MethodDecorator[] | undefined;
  };
};

export interface BoundBuilders<
  TBase extends string,
  TParamsSchema extends z.ZodObject | undefined = undefined,
> {
  read<
    TInput extends z.ZodObject | undefined = undefined,
    TOutput extends OperationOutputConfig = OperationOutputSchema,
    const TOpPath extends string = '',
  >(
    config: ReadBuilderConfig<
      TInput,
      TOutput,
      EffectiveParams<TBase, TOpPath, TParamsSchema>,
      TOpPath
    >,
  ): PendingOperation<
    InferIn<TInput>,
    InferOut<TOutput>,
    EffectiveParams<TBase, TOpPath, TParamsSchema>
  >;

  write<
    TInput extends z.ZodObject | undefined = undefined,
    TOutput extends OperationOutputConfig = OperationOutputSchema,
    const TOpPath extends string = '',
  >(
    config: WriteBuilderConfig<
      TInput,
      TOutput,
      EffectiveParams<TBase, TOpPath, TParamsSchema>,
      TOpPath
    >,
  ): PendingOperation<
    InferIn<TInput>,
    InferOut<TOutput>,
    EffectiveParams<TBase, TOpPath, TParamsSchema>
  >;

  delete<
    TInput extends z.ZodObject | undefined = undefined,
    TOutput extends OperationOutputConfig = OperationOutputSchema,
    const TOpPath extends string = '',
  >(
    config: DeleteBuilderConfig<
      TInput,
      TOutput,
      EffectiveParams<TBase, TOpPath, TParamsSchema>,
      TOpPath
    >,
  ): PendingOperation<
    InferIn<TInput>,
    InferOut<TOutput>,
    EffectiveParams<TBase, TOpPath, TParamsSchema>
  >;
}

export interface OperationResourceInput<
  TBase extends string,
  TOps extends OperationRecord,
  TParamsSchema extends z.ZodObject | undefined = undefined,
> {
  readonly path: TBase;
  readonly tags?: readonly string[];
  readonly public?: boolean;
  /**
   * Optional zod object for path params. Keys must be `:params` present on
   * `path`. Validated at request time (400). Improves `ctx.params` typing
   * when the schema output is narrower than `string`.
   */
  readonly params?: TParamsSchema;
  /**
   * Callback form only — builders must see the base path so `ctx.params`
   * can be typed from `:segments`. Split-file composition: export
   * `(op) => op.write({...})` factories and spread them into the record.
   */
  readonly operations: (op: BoundBuilders<TBase, TParamsSchema>) => TOps;
  readonly imports?: OperationResourceDefinition['imports'];
  readonly providers?: OperationResourceDefinition['providers'];
  readonly exports?: OperationResourceDefinition['exports'];
  readonly decorators?: OperationResourceDefinition['decorators'];
}

/**
 * Zod authoring result: planner-compatible {@link OperationResource} plus the
 * typed authored operation record (for ClientOf / inference consumers).
 */
export type ZodOperationResource<TOps extends OperationRecord> =
  OperationResource & {
    readonly authored: TOps;
  };

/** Runtime extract of `:param` names from a path template. */
export function extractPathParamNames(path: string): string[] {
  const names: string[] = [];
  const re = /:([A-Za-z_][A-Za-z0-9_]*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(path)) !== null) {
    const name = match[1];
    if (name !== undefined && !names.includes(name)) {
      names.push(name);
    }
  }
  return names;
}

function assertParamsSchemaMatchesPath(
  resourcePath: string,
  paramsSchema: z.ZodObject,
): void {
  const pathKeys = new Set(extractPathParamNames(resourcePath));
  for (const key of Object.keys(paramsSchema.shape)) {
    if (!pathKeys.has(key)) {
      throw new Error(
        `operationResource "${resourcePath}": params.${key} is not a :param ` +
          `on path "${resourcePath}"`,
      );
    }
  }
}

function defaultMethod(
  builder: PendingBuilder,
  configured: OperationHttpMethod | undefined,
): OperationHttpMethod {
  if (configured !== undefined) {
    return configured;
  }
  if (builder === 'read') {
    return 'GET';
  }
  if (builder === 'delete') {
    return 'DELETE';
  }
  return 'POST';
}

function defaultStatus(configured: number | undefined): number {
  return configured ?? 200;
}

function compileOperationDto(schema: z.ZodType, name: string): Type<object> {
  if (schema instanceof z.ZodObject) {
    return compileDtoClass(schema, name);
  }
  if (schema instanceof z.ZodArray) {
    const cls = createZodDto(schema);
    Object.defineProperty(cls, 'name', { value: name });
    return cls;
  }
  throw new Error(
    `operationResource DTO "${name}": expected z.object(...) or z.array(...), ` +
      `got ${schema.constructor.name}`,
  );
}

function assertOperationHandler(
  handler: unknown,
  resourcePath: string,
  key: string,
): asserts handler is CompiledOperationDescriptor['handler'] {
  if (typeof handler !== 'function') {
    throw new Error(
      `operationResource "${resourcePath}": operation "${key}" handler must be ` +
        `a function or injectable class`,
    );
  }
}

function compileOperation(
  key: string,
  pending: OperationRecord[string],
  resourcePath: string,
): CompiledOperationDescriptor {
  const method = defaultMethod(pending.builder, pending.method);
  const status = defaultStatus(pending.status);
  // path=key by default; explicit `path: ''` keeps a root mount (?? not ||).
  const path = pending.path ?? key;

  let inputDto: Type<object> | undefined;
  if (pending.input !== undefined) {
    inputDto = compileDtoClass(
      pending.input,
      `${pascal(resourcePath)}_${pascal(method.toLowerCase())}_${pascal(
        key,
      )}Input`,
    );
  }

  let outputDto: Type<object> | undefined;
  let outputDisabled = false;
  if (pending.output === false) {
    outputDisabled = true;
  } else {
    outputDto = compileOperationDto(
      pending.output,
      `${pascal(resourcePath)}_${pascal(method.toLowerCase())}_${pascal(
        key,
      )}Output`,
    );
  }

  if (status === 204 && outputDto !== undefined) {
    throw new Error(
      `operationResource "${resourcePath}": operation "${key}" sets status 204 ` +
        `with an output schema — 204 responses have no body. Use output: false ` +
        `or a non-204 status.`,
    );
  }

  assertOperationHandler(pending.handler, resourcePath, key);

  return {
    key,
    method,
    path,
    status,
    summary: pending.summary,
    public: pending.public,
    transactional: pending.transactional,
    inputDto,
    outputDto,
    outputDisabled,
    handler: pending.handler,
    decorators: pending.decorators,
  };
}

function pascal(value: string): string {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toPendingRead<
  TInput extends z.ZodObject | undefined,
  TOutput extends OperationOutputConfig,
  TParams extends object,
  TOpPath extends string,
>(
  config: ReadBuilderConfig<TInput, TOutput, TParams, TOpPath>,
): PendingOperation<InferIn<TInput>, InferOut<TOutput>, TParams> {
  return {
    builder: 'read',
    method: defaultMethod('read', config.method),
    path: config.path,
    status: config.status,
    summary: config.summary,
    public: config.public,
    transactional: config.transactional,
    input: config.input,
    output: config.output,
    handler: config.handler,
    decorators: config.decorators,
  };
}

function toPendingWrite<
  TInput extends z.ZodObject | undefined,
  TOutput extends OperationOutputConfig,
  TParams extends object,
  TOpPath extends string,
>(
  config: WriteBuilderConfig<TInput, TOutput, TParams, TOpPath>,
): PendingOperation<InferIn<TInput>, InferOut<TOutput>, TParams> {
  return {
    builder: 'write',
    method: defaultMethod('write', config.method),
    path: config.path,
    status: config.status,
    summary: config.summary,
    public: config.public,
    transactional: config.transactional,
    input: config.input,
    output: config.output,
    handler: config.handler,
    decorators: config.decorators,
  };
}

function toPendingDelete<
  TInput extends z.ZodObject | undefined,
  TOutput extends OperationOutputConfig,
  TParams extends object,
  TOpPath extends string,
>(
  config: DeleteBuilderConfig<TInput, TOutput, TParams, TOpPath>,
): PendingOperation<InferIn<TInput>, InferOut<TOutput>, TParams> {
  return {
    builder: 'delete',
    method: defaultMethod('delete', config.method),
    path: config.path,
    status: config.status,
    summary: config.summary,
    public: config.public,
    transactional: config.transactional,
    input: config.input,
    output: config.output,
    handler: config.handler,
    decorators: config.decorators,
  };
}

function createBoundBuilders<
  TBase extends string,
  TParamsSchema extends z.ZodObject | undefined,
>(): BoundBuilders<TBase, TParamsSchema> {
  return {
    read: toPendingRead,
    write: toPendingWrite,
    delete: toPendingDelete,
  };
}

/**
 * Zod-first sibling of {@link defineResource} for typed non-CRUD endpoints
 * (issue #43 / #50 authoring surface).
 *
 * - `operations` is a callback so base-path params type `ctx.params`.
 * - Builders: `read` (GET), `write` (POST/PUT/PATCH), `delete` (DELETE).
 * - `output` is required (`schema` or `false`) so responses cannot silently leak.
 * - Operation path defaults to its key (verbatim). Use `path: ''` for a
 *   root-mounted route on the resource path.
 */
export function operationResource<
  const TBase extends string,
  TOps extends OperationRecord,
  TParamsSchema extends z.ZodObject | undefined = undefined,
>(
  input: OperationResourceInput<TBase, TOps, TParamsSchema>,
): ZodOperationResource<TOps> {
  const builders = createBoundBuilders<TBase, TParamsSchema>();
  const authored = input.operations(builders);

  let paramsDto: Type<object> | undefined;
  if (input.params !== undefined) {
    assertParamsSchemaMatchesPath(input.path, input.params);
    paramsDto = compileDtoClass(input.params, `${pascal(input.path)}_Params`);
  }

  const operations: Record<string, CompiledOperationDescriptor> = {};
  for (const [key, pending] of Object.entries(authored)) {
    assertValidOperationKey(key, input.path);
    operations[key] = compileOperation(key, pending, input.path);
  }

  const resource = defineOperationResource({
    path: input.path,
    tags: input.tags,
    public: input.public,
    paramsDto,
    operations,
    imports: input.imports,
    providers: input.providers,
    exports: input.exports,
    decorators: input.decorators,
  });

  const result: ZodOperationResource<TOps> = {
    ...resource,
    authored,
  };
  return result;
}
