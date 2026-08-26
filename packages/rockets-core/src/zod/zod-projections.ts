import type { PlainLiteralObject, Type } from '@nestjs/common';
import { withOpenApi } from '@concepta/nestjs-core';
import { z } from 'zod';
import type { ResourceRelationEntry } from '../index';
import { resolveRelationTarget } from './schema-registry';
import {
  asClassicSchema,
  isDbGenerated,
  relationPropertyFor,
  rocketsFieldMeta,
  type RocketsRelationTarget,
  unwrapField,
} from './field-meta';

export type ComputeFn = (row: Readonly<Record<string, unknown>>) => unknown;

export interface SchemaProjections {
  readonly create: Record<string, z.ZodType>;
  readonly update: Record<string, z.ZodType>;
  readonly response: Record<string, z.ZodType>;
  /** Response-only computed fields, keyed by response property. */
  readonly compute: Record<string, ComputeFn>;
  readonly pkKey: string | undefined;
  readonly relations: ReadonlyArray<ResourceRelationEntry<PlainLiteralObject>>;
}

export function projectSchema(
  resourceName: string,
  schema: z.ZodObject,
  entity: Type<PlainLiteralObject>,
  ownerColumns: ReadonlySet<string>,
): SchemaProjections {
  const create: Record<string, z.ZodType> = {};
  const update: Record<string, z.ZodType> = {};
  const response: Record<string, z.ZodType> = {};
  const compute: Record<string, ComputeFn> = {};
  const relations: ResourceRelationEntry<PlainLiteralObject>[] = [];
  let pkKey: string | undefined;

  for (const [key, field] of Object.entries(schema.shape)) {
    const path = `${resourceName}.${key}`;
    const { meta } = unwrapField(field, path);
    const relation = meta.relation;

    if (meta.compute !== undefined) {
      response[key] = withHiddenFieldsRemoved(field, path);
      compute[key] = meta.compute;
      continue;
    }

    if (relation?.kind === 'hasMany') {
      if (relation.expose === true) {
        const nested = exposedResponseSchema(
          relation.shape ?? relation.target,
          `${resourceName}${pascal(key)}ResponseDto`,
          path,
        );
        response[key] = z.array(nested).optional();
      }
      if (relation.include !== undefined) {
        relations.push({
          source: entity,
          target: () => resolveRelationTarget(relation.target, path),
          propertyName: key,
          include: relation.include,
        });
      }
      continue;
    }

    const generated = isDbGenerated(meta);
    const isPk = meta.db?.pk === true;
    if (isPk) {
      pkKey = key;
    }

    const isOwner = ownerColumns.has(key);

    if (!isOwner && (meta.dto?.create ?? !generated)) {
      create[key] = field;
    }
    if (
      !isOwner &&
      (isPk ? meta.dto?.update !== false : meta.dto?.update ?? !generated)
    ) {
      update[key] = field.optional();
    }
    if (isResponseExposed(meta)) {
      assertNotIsoDateTime(field, path);
      response[key] = asStoredShape(field, path);
    }

    if (relation !== undefined) {
      const property = relationPropertyFor(key, relation, path);
      if (relation.expose === true) {
        const nested = exposedResponseSchema(
          relation.shape ?? relation.target,
          `${resourceName}${pascal(property)}ResponseDto`,
          path,
        );
        response[property] = nested.optional();
      }
      if (relation.include !== undefined) {
        relations.push({
          source: entity,
          target: () => resolveRelationTarget(relation.target, path),
          propertyName: property,
          include: relation.include,
        });
      }
    }
  }

  return { create, update, response, compute, pkKey, relations };
}

export function hasDeletedAtField(schema: z.ZodObject): boolean {
  return Object.entries(schema.shape).some(
    ([key, field]) => unwrapField(field, key).meta.db?.deletedAt === true,
  );
}

/**
 * A response-exposed `z.iso.datetime()` is a guaranteed 500: every
 * adapter hands rows back with `Date` objects (TypeORM natively, Firestore
 * via its timestamp normalisation), and the response schema validates the
 * row before it is serialized. Caught at definition time instead.
 */
function assertNotIsoDateTime(field: z.ZodType, path: string): void {
  const { base } = unwrapField(field, path);
  if (base instanceof z.ZodISODateTime) {
    throw new Error(
      `[zodResource] "${path}" is z.iso.datetime() and exposed on the ` +
        'response, but rows carry Date objects — the response schema would ' +
        'reject every row. Use f.date() for a writable datetime, ' +
        'f.createdAt() / f.updatedAt() / f.deletedAt() for audit columns, ' +
        'or z.date() directly.',
    );
  }
}

/**
 * Response projection of a relation target, as a NAMED component so the
 * parent's document `$ref`s it. Built once per (parent, property): the
 * instance embedded in the parent response is the one that carries the
 * id, which is what makes the reference resolve.
 */
function exposedResponseSchema(
  target: RocketsRelationTarget,
  id: string,
  path: string,
): z.ZodObject {
  const resolved = target();
  if (!(resolved instanceof z.ZodObject)) {
    throw new Error(
      `[zodResource] Relation at "${path}" sets expose:true but targets an ` +
        'entity class — only a zod schema target can be projected into the ' +
        'response document.',
    );
  }
  const shape: Record<string, z.ZodType> = {};
  for (const [key, field] of Object.entries(resolved.shape)) {
    const { meta } = unwrapField(field, `${path}.${key}`);
    if (isResponseExposed(meta)) {
      assertNotIsoDateTime(field, `${path}.${key}`);
      shape[key] = asStoredShape(field, `${path}.${key}`);
    }
  }
  return withOpenApi(z.object(shape), id);
}

/**
 * The response validates the ROW, and an optional field without a
 * default is a nullable column: a row that never set it reads back as
 * `null` (SQL) — not `undefined`. Declaring `.optional()` alone would make
 * the response schema reject every such row. The wire contract says what
 * the store actually returns: `null` is admitted; `undefined` (a plain
 * adapter that omits the key) still is.
 */
function asStoredShape(field: z.ZodType, path: string): z.ZodType {
  const { optional, nullable, hasDefault } = unwrapField(field, path);
  return optional && !nullable && !hasDefault ? field.nullable() : field;
}

/**
 * Response exposure is OPT-IN. A field reaches the response schema only
 * when it says so (`dto.response: true` — every `f.*` helper sets it) or
 * when it is a base-entity column (pk / createdAt / updatedAt /
 * deletedAt). Raw `z.string()` with no metadata stays hidden, so
 * forgetting to annotate fails closed.
 *
 * There is deliberately NO name-based heuristic. Guessing sensitivity
 * from an identifier substring is wrong in both directions — it eats
 * `hashtags` and `tokenExpiresAt` while waving through `apiKey`, `salt`
 * and `cardNumber` — and it cannot add safety on top of a default that
 * already fails closed. Keep secrets out with an explicit
 * `dto: { response: false }`.
 */
function isResponseExposed(
  meta: ReturnType<typeof unwrapField>['meta'],
): boolean {
  if (meta.dto?.response !== undefined) {
    return meta.dto.response;
  }
  return isBaseEntityResponseField(meta);
}

/**
 * A computed field's schema is an explicit wire declaration, so it is NOT
 * subject to the opt-in rule — the author already said what goes out.
 * But `dto: { response: false }` means "never on the wire", and that must
 * hold here too.
 *
 * It matters because compute schemas are routinely built FROM an entity
 * schema (`f.compute(z.array(tagSchema), …)`), which can carry columns
 * that were deliberately hidden. Without this, `response: false` was
 * honoured on the owning resource and silently ignored the moment the
 * same schema was projected through a computed field.
 *
 * Returns the field untouched when nothing is hidden, so the common case
 * keeps its exact original wrappers.
 */
function withHiddenFieldsRemoved(field: z.ZodType, path: string): z.ZodType {
  const { base, optional, nullable, meta } = unwrapField(field, path);
  const stripped = stripHidden(base, path);
  if (stripped === base) {
    return field;
  }
  let rebuilt = stripped;
  if (nullable) rebuilt = rebuilt.nullable();
  if (optional) rebuilt = rebuilt.optional();
  // The rebuilt node is a NEW zod instance; re-registering keeps the
  // field meta readable on the response shape (`readFieldMetaDeep`).
  rocketsFieldMeta.add(rebuilt, meta);
  return rebuilt;
}

/**
 * Recursive: a hidden column N levels down a computed shape stays hidden.
 * Objects, arrays and the `optional` / `nullable` wrappers around them are
 * rebuilt when something underneath changed; every other node is returned
 * as-is (identity is preserved when nothing was hidden).
 */
function stripHidden(schema: z.ZodType, path: string): z.ZodType {
  if (schema instanceof z.ZodObject) {
    return stripHiddenObject(schema, path);
  }
  if (schema instanceof z.ZodArray) {
    const element = asClassicSchema(schema.element, `${path}[]`);
    const stripped = stripHidden(element, `${path}[]`);
    return stripped === element ? schema : z.array(stripped);
  }
  if (schema instanceof z.ZodOptional) {
    const inner = asClassicSchema(schema.unwrap(), path);
    const stripped = stripHidden(inner, path);
    return stripped === inner ? schema : stripped.optional();
  }
  if (schema instanceof z.ZodNullable) {
    const inner = asClassicSchema(schema.unwrap(), path);
    const stripped = stripHidden(inner, path);
    return stripped === inner ? schema : stripped.nullable();
  }
  return schema;
}

function stripHiddenObject(schema: z.ZodObject, path: string): z.ZodObject {
  const shape: Record<string, z.ZodType> = {};
  let changed = false;
  for (const [key, field] of Object.entries(schema.shape)) {
    const fieldPath = `${path}.${key}`;
    const { meta } = unwrapField(field, fieldPath);
    if (meta.dto?.response === false) {
      changed = true;
      continue;
    }
    const stripped = stripHidden(asClassicSchema(field, fieldPath), fieldPath);
    if (stripped !== field) changed = true;
    shape[key] = stripped;
  }
  return changed ? z.object(shape) : schema;
}

function isBaseEntityResponseField(
  meta: ReturnType<typeof unwrapField>['meta'],
): boolean {
  const db = meta.db;
  if (db === undefined) {
    return false;
  }
  return (
    db.pk === true ||
    db.createdAt === true ||
    db.updatedAt === true ||
    db.deletedAt === true
  );
}

function pascal(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
