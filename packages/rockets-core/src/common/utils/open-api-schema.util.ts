import { withOpenApi } from '@concepta/nestjs-core';
import { paginatedSchema } from '@concepta/nestjs-crud';
import { z } from 'zod';
import { asClassicSchema } from '../../zod/field-meta';

/** The OpenAPI component id a schema carries (`schema.meta({ id })`). */
export function readSchemaId(schema: z.ZodType): string | undefined {
  const id: unknown = schema.meta()?.id;
  return typeof id === 'string' ? id : undefined;
}

function isObjectLike(value: unknown): value is Record<PropertyKey, unknown> {
  return (
    (typeof value === 'object' && value !== null) || typeof value === 'function'
  );
}

/** Whether `withOpenApi()` attached the JSON Schema bridge to this schema. */
export function isOpenApiBridged(schema: z.ZodType): boolean {
  const jsonSchema: unknown = Reflect.get(schema['~standard'], 'jsonSchema');
  return (
    isObjectLike(jsonSchema) &&
    typeof jsonSchema.input === 'function' &&
    typeof jsonSchema.output === 'function'
  );
}

/**
 * Asserts a schema is a NAMED OpenAPI component: it carries an id AND the
 * JSON Schema bridge, on THIS instance.
 *
 * Both are checked because the bridge alone lies: every chained call after
 * `withOpenApi()` (`.extend()`, `.strict()`, `.optional()`, `.array()`,
 * `.pick()`, …) returns a clone that drops the id but keeps a bridge bound
 * to the ORIGINAL shape — the document would describe a schema the route no
 * longer validates with. Requiring the id catches every wrap-not-last.
 */
export function assertNamedSchema(
  schema: unknown,
  context: string,
): asserts schema is z.ZodType {
  if (!(schema instanceof z.ZodType)) {
    throw new Error(
      `${context}: expected a zod schema, got ${describeValue(schema)}.`,
    );
  }
  if (readSchemaId(schema) === undefined || !isOpenApiBridged(schema)) {
    throw new Error(
      `${context}: schema is not a named OpenAPI component. Wrap it LAST ` +
        `with withOpenApi(schema, 'ComponentName') — any call chained after ` +
        `the wrap (.extend(), .strict(), .optional(), .array(), .pick(), …) ` +
        `returns a clone without the id.`,
    );
  }
}

function describeValue(value: unknown): string {
  if (typeof value === 'function') return `class/function ${value.name}`;
  if (value === null) return 'null';
  return typeof value;
}

/**
 * Response schemas must STRIP undeclared keys: a `.passthrough()` /
 * `.catchall()` node anywhere in the tree would ship whatever the row
 * carries — a hidden column, a joined relation's secrets. The check walks
 * objects, arrays, wrappers, pipes (the `out` side of a `z.preprocess`)
 * and unions; a declared `z.record()` is an explicit choice and passes.
 */
export function assertFailClosedResponse(
  schema: z.ZodType,
  context: string,
): void {
  const open = findOpenObject(schema, new Set(), '$');
  if (open !== undefined) {
    throw new Error(
      `${context}: response schema has an open object at "${open}" ` +
        `(.passthrough() / .catchall()). Response schemas must strip ` +
        `undeclared keys — declare the keys you want on the wire.`,
    );
  }
}

function findOpenObject(
  schema: z.ZodType,
  seen: Set<z.ZodType>,
  path: string,
): string | undefined {
  if (seen.has(schema)) return undefined;
  seen.add(schema);

  if (schema instanceof z.ZodObject) {
    const catchall = schema.def.catchall;
    if (catchall !== undefined && !(catchall instanceof z.ZodNever)) {
      return path;
    }
    for (const [key, field] of Object.entries(schema.shape)) {
      const found = findOpenObject(
        asClassicSchema(field, `${path}.${key}`),
        seen,
        `${path}.${key}`,
      );
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (schema instanceof z.ZodArray) {
    return findOpenObject(
      asClassicSchema(schema.element, `${path}[]`),
      seen,
      `${path}[]`,
    );
  }
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return findOpenObject(asClassicSchema(schema.unwrap(), path), seen, path);
  }
  if (schema instanceof z.ZodDefault) {
    return findOpenObject(
      asClassicSchema(schema.def.innerType, path),
      seen,
      path,
    );
  }
  if (schema instanceof z.ZodPipe) {
    return findOpenObject(asClassicSchema(schema.def.out, path), seen, path);
  }
  if (schema instanceof z.ZodLazy) {
    return findOpenObject(asClassicSchema(schema.unwrap(), path), seen, path);
  }
  if (schema instanceof z.ZodUnion) {
    for (const [index, option] of schema.options.entries()) {
      const found = findOpenObject(
        asClassicSchema(option, `${path}|${index}`),
        seen,
        `${path}|${index}`,
      );
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

/**
 * The paginated envelope for a named response schema, named after it
 * (`TagResponseDto` → `TagResponseDtoPaginatedDto`) and cached per
 * resource instance: one resource, one paginated component, however many
 * places ask for it. Two DIFFERENT instances claiming one id would fail
 * in the document converter, so the cache is load-bearing.
 */
const paginatedCache = new WeakMap<z.ZodType, z.ZodType>();

export function buildPaginatedSchema(
  resource: z.ZodType,
  context: string,
): z.ZodType {
  const cached = paginatedCache.get(resource);
  if (cached !== undefined) return cached;
  assertNamedSchema(resource, context);
  const built = withOpenApi(
    paginatedSchema(resource),
    `${readSchemaId(resource)}PaginatedDto`,
  );
  paginatedCache.set(resource, built);
  return built;
}
