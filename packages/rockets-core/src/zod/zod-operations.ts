import type { ClassTransformOptions } from 'class-transformer';
import type { z } from 'zod';
import type {
  ResourceDeleteOperationConfig,
  ResourceOperationConfig,
  ResourceRestoreOperationConfig,
} from '../index';

export type ZodCrudOperation =
  | 'list'
  | 'read'
  | 'create'
  | 'update'
  | 'replace'
  | 'delete'
  | 'restore';

/**
 * Per-operation `input` / `output` overrides on the zod path.
 *
 * The class path takes DTO **classes** here; the zod path takes
 * **schemas**, and compiles them to DTO classes with the same pipeline
 * the schema-derived projections use (Standard Schema validation +
 * OpenAPI components). Omit either one to keep the projection derived
 * from the resource schema.
 *
 * An override replaces the projection outright — it is not merged with
 * it. A field the resource schema hides via `dto: { response: false }`
 * is exposed again if the override schema declares it; that is the same
 * explicit opt-in the class path has when an app passes its own DTO.
 */
export interface ZodOperationSchemas {
  /**
   * Request body schema. Only valid on operations that HAVE a request
   * body (`create`, `update`, `replace`); `zodResource` throws otherwise
   * rather than accept a value core would ignore.
   */
  readonly input?: z.ZodObject;
  /**
   * Response schema for the single-item body. Only valid on operations
   * that HAVE a response body — `delete` / `restore` need
   * `returnDeleted` / `returnRestored` (on a hard delete too), otherwise
   * they answer `204` and the override would be silently dropped.
   */
  readonly output?: z.ZodObject;
}

/**
 * Per-operation config accepted by the zod layer: everything
 * `defineResource` accepts for the operation, with `input` / `output`
 * re-typed as zod schemas. `true` enables the operation with defaults;
 * `false` / omitted disables it.
 */
export type ZodOperationConfig = Omit<
  ResourceOperationConfig,
  'input' | 'output'
> &
  ZodOperationSchemas;
export type ZodDeleteOperationConfig = Omit<
  ResourceDeleteOperationConfig,
  'input' | 'output'
> &
  ZodOperationSchemas;
export type ZodRestoreOperationConfig = Omit<
  ResourceRestoreOperationConfig,
  'input' | 'output'
> &
  ZodOperationSchemas;

export interface ZodResourceOperations {
  readonly list?: boolean | ZodOperationConfig;
  readonly read?: boolean | ZodOperationConfig;
  readonly create?: boolean | ZodOperationConfig;
  readonly update?: boolean | ZodOperationConfig;
  readonly replace?: boolean | ZodOperationConfig;
  readonly delete?: boolean | ZodDeleteOperationConfig;
  readonly restore?: boolean | ZodRestoreOperationConfig;
}

const DEFAULT_OPERATIONS: ZodResourceOperations = {
  list: true,
  read: true,
  create: true,
  update: true,
  delete: true,
};

export function normalizeOperations(
  operations: readonly ZodCrudOperation[] | ZodResourceOperations | undefined,
): ZodResourceOperations {
  if (operations === undefined) {
    return DEFAULT_OPERATIONS;
  }
  if (Array.isArray(operations)) {
    return Object.fromEntries(
      (operations as readonly ZodCrudOperation[]).map((op) => [op, true]),
    );
  }
  return operations as ZodResourceOperations;
}

export function opConfig<T extends object>(
  value: boolean | T | undefined,
): T | Record<string, never> {
  return typeof value === 'object' ? value : {};
}

/**
 * Outbound serialization for zod DTO responses. The module default pair
 * (`strategy: 'excludeAll'` + `excludeExtraneousValues`) makes
 * class-transformer SKIP custom `@Transform`s on `classToPlain` and
 * recursively empty free-form objects (json columns). Whitelisting
 * already happened on the way IN (`toInstance` keeps the excludeAll
 * defaults); the way out only needs prefix hygiene.
 */
const ZOD_TO_PLAIN_OPTIONS: ClassTransformOptions = {
  strategy: 'exposeAll',
  excludeExtraneousValues: false,
  excludePrefixes: ['_', '__'],
};

/**
 * Per-operation config with the zod outbound serialization installed,
 * preserving any consumer-provided `responseOverride` keys (theirs win).
 */
export function zodOpConfig<T extends ZodOperationConfig>(
  value: boolean | T | undefined,
): ResourceOperationConfig {
  // `input` / `output` are zod schemas on this path; the compiler turns
  // them into DTO classes and re-attaches them. Dropping them here keeps
  // a schema from reaching core where a `Type` is expected.
  const { input: _input, output: _output, ...config } = opConfig(value);
  return {
    ...config,
    responseOverride: {
      ...config.responseOverride,
      serialization: {
        toPlainOptions: ZOD_TO_PLAIN_OPTIONS,
        ...config.responseOverride?.serialization,
      },
    },
  };
}
