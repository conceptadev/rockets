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
 * every node that can hold another schema — objects, arrays, tuples,
 * unions, intersections, record / map / set values, pipes (the `out` side
 * of a `z.preprocess`), lazies and every single-child wrapper
 * (`optional`, `nullable`, `default`, `readonly`, `catch`, …). A
 * `z.record()` of primitives is an explicit choice and passes; a record
 * whose value is an open object does not.
 */
export function assertFailClosedResponse(
  schema: z.ZodType,
  context: string,
): void {
  const open = findOpenResponseObject(schema);
  if (open !== undefined) {
    throw new Error(
      `${context}: response schema has an open object at "${open}" ` +
        `(.passthrough() / .catchall()). Response schemas must strip ` +
        `undeclared keys — declare the keys you want on the wire.`,
    );
  }
}

/**
 * The path of the first open object in a response schema, or `undefined`
 * when it strips everywhere. Non-throwing form of
 * {@link assertFailClosedResponse} for callers that report instead of
 * failing (the route audit).
 */
export function findOpenResponseObject(schema: z.ZodType): string | undefined {
  return findOpenObject(schema, new Set(), '$');
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
  }
  for (const [childPath, child] of schemaChildren(schema, path)) {
    const found = findOpenObject(
      asClassicSchema(child, childPath),
      seen,
      childPath,
    );
    if (found !== undefined) return found;
  }
  return undefined;
}

/**
 * Every schema a node can hold, with the path label of each — the one
 * walker every response-safety check shares. Structural
 * nodes are matched by class; everything that wraps ONE inner schema
 * (`optional`, `nullable`, `default`, `prefault`, `readonly`, `catch`,
 * `nonoptional`, `promise`, …) is read through the shared `innerType`
 * slot so a wrapper zod adds later is walked without a new case here.
 */
/**
 * An `out` side that hands its input through unchanged — a transform,
 * `any`, `unknown`, `custom`, or one of those behind a single-child
 * wrapper (`optional`, `nullable`, `readonly`, …), a lazy, or a union
 * with at least one pass-through member.
 */
function passesThrough(
  schema: z.ZodType,
  path: string,
  seen: Set<z.ZodType> = new Set(),
): boolean {
  if (seen.has(schema)) return false;
  seen.add(schema);
  if (
    schema instanceof z.ZodTransform ||
    schema instanceof z.ZodAny ||
    schema instanceof z.ZodUnknown ||
    schema instanceof z.ZodCustom
  ) {
    return true;
  }
  if (schema instanceof z.ZodUnion) {
    return schema.options.some((option) =>
      passesThrough(asClassicSchema(option, path), path, seen),
    );
  }
  if (schema instanceof z.ZodLazy) {
    return passesThrough(asClassicSchema(schema.unwrap(), path), path, seen);
  }
  const inner: unknown = Reflect.get(schema.def, 'innerType');
  return inner instanceof z.ZodType ? passesThrough(inner, path, seen) : false;
}

export function schemaChildren(
  schema: z.ZodType,
  path: string,
): Array<[string, z.core.$ZodType]> {
  if (schema instanceof z.ZodObject) {
    return Object.entries(schema.shape).map(([key, field]) => [
      `${path}.${key}`,
      field,
    ]);
  }
  if (schema instanceof z.ZodArray) {
    return [[`${path}[]`, schema.element]];
  }
  if (schema instanceof z.ZodTuple) {
    const items: Array<[string, z.core.$ZodType]> = schema.def.items.map(
      (item, index) => [`${path}[${index}]`, item],
    );
    if (schema.def.rest !== null) {
      items.push([`${path}[...]`, schema.def.rest]);
    }
    return items;
  }
  if (schema instanceof z.ZodUnion) {
    return schema.options.map((option, index) => [`${path}|${index}`, option]);
  }
  if (schema instanceof z.ZodIntersection) {
    return [
      [`${path}&0`, schema.def.left],
      [`${path}&1`, schema.def.right],
    ];
  }
  if (
    schema instanceof z.ZodRecord ||
    schema instanceof z.ZodMap ||
    schema instanceof z.ZodSet
  ) {
    return [[`${path}[*]`, schema.def.valueType]];
  }
  if (schema instanceof z.ZodPipe) {
    // `z.preprocess` puts the object on `out`; an ordinary `.transform()`
    // puts it on `in` and its `out` is the transform node, which passes
    // whatever `in` let through — as do `z.any()`, `z.unknown()` and
    // `z.custom()`. A pipe whose `out` is a real schema
    // (`z.pipe(open, closed)`) strips on the way out, so `in` is only
    // walked when `out` passes values through.
    return passesThrough(asClassicSchema(schema.def.out, path), path)
      ? [
          [`${path}<in`, schema.def.in],
          [path, schema.def.out],
        ]
      : [[path, schema.def.out]];
  }
  if (schema instanceof z.ZodLazy) {
    return [[path, schema.unwrap()]];
  }
  const inner: unknown = Reflect.get(schema.def, 'innerType');
  if (inner instanceof z.ZodType) {
    return [[path, inner]];
  }
  return [];
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
