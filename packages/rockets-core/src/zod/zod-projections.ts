import type { PlainLiteralObject, Type } from '@nestjs/common';
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

export interface SchemaProjections {
  readonly create: Record<string, z.ZodType>;
  readonly update: Record<string, z.ZodType>;
  readonly response: Record<string, z.ZodType>;
  readonly responseNested: Record<string, z.ZodObject>;
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
  const responseNested: Record<string, z.ZodObject> = {};
  const relations: ResourceRelationEntry<PlainLiteralObject>[] = [];
  let pkKey: string | undefined;

  for (const [key, field] of Object.entries(schema.shape)) {
    const path = `${resourceName}.${key}`;
    const { meta } = unwrapField(field, path);
    const relation = meta.relation;

    if (meta.compute !== undefined) {
      response[key] = withHiddenFieldsRemoved(field, path);
      continue;
    }

    if (relation?.kind === 'hasMany') {
      if (relation.expose === true) {
        const nested = exposedResponseSchema(
          relation.shape ?? relation.target,
          path,
        );
        responseNested[key] = nested;
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
      response[key] = field;
    }

    if (relation !== undefined) {
      const property = relationPropertyFor(key, relation, path);
      if (relation.expose === true) {
        const nested = exposedResponseSchema(
          relation.shape ?? relation.target,
          path,
        );
        responseNested[property] = nested;
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

  return { create, update, response, responseNested, pkKey, relations };
}

export function hasDeletedAtField(schema: z.ZodObject): boolean {
  return Object.entries(schema.shape).some(
    ([key, field]) => unwrapField(field, key).meta.db?.deletedAt === true,
  );
}

function exposedResponseSchema(
  target: RocketsRelationTarget,
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
      shape[key] = field;
    }
  }
  return z.object(shape);
}

/**
 * Response exposure is OPT-IN. A field reaches the response DTO only
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
  // The rebuilt node is a NEW zod instance; without re-registering the
  // original field meta, `compileDtoClass` would no longer see
  // `meta.compute` and the field would silently vanish from every HTTP
  // response while OpenAPI still documented it.
  rocketsFieldMeta.add(rebuilt, meta);
  return rebuilt;
}

function stripHidden(schema: z.ZodType, path: string): z.ZodType {
  if (schema instanceof z.ZodObject) {
    return stripHiddenObject(schema, path);
  }
  if (schema instanceof z.ZodArray) {
    const element = asClassicSchema(schema.element, path);
    if (element instanceof z.ZodObject) {
      const strippedElement = stripHiddenObject(element, path);
      return strippedElement === element ? schema : z.array(strippedElement);
    }
  }
  return schema;
}

function stripHiddenObject(schema: z.ZodObject, path: string): z.ZodObject {
  const shape: Record<string, z.ZodType> = {};
  let hidAny = false;
  for (const [key, field] of Object.entries(schema.shape)) {
    const { meta } = unwrapField(field, `${path}.${key}`);
    if (meta.dto?.response === false) {
      hidAny = true;
      continue;
    }
    shape[key] = field;
  }
  return hidAny ? z.object(shape) : schema;
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
