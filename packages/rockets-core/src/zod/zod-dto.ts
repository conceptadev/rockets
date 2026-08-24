import type { Type } from '@nestjs/common';
import {
  Exclude,
  Expose,
  Transform,
  Type as TransformType,
} from 'class-transformer';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { asClassicSchema, unwrapField } from './field-meta';
import { attachOperationDtoOpenApiFields } from '../infrastructure/resource/operation-resource/openapi-dto-metadata';
import { ROCKETS_GENERATED_DTO_NAME } from '../infrastructure/resource/operation-resource/build-operation-controller';

type ZodShapeField = z.ZodType;

function isOptionalZodField(field: ZodShapeField): boolean {
  if (typeof field.isOptional === 'function') {
    return field.isOptional();
  }
  const def = (field as { def?: { type?: string } }).def;
  return def?.type === 'optional' || def?.type === 'default';
}

function openApiSchemaFromZodField(
  field: ZodShapeField,
): Record<string, unknown> {
  try {
    const json = z.toJSONSchema(field) as Record<string, unknown>;
    const { $schema: _schema, ...rest } = json;
    return rest;
  } catch {
    return { type: 'string' };
  }
}

/**
 * Names a freshly created DTO class and marks the name as Rockets-minted.
 *
 * Every path that mints a DTO name must go through here. `compileDtoClass`
 * did and the `z.array` branch of `compileOperationDto` did not, so array
 * outputs — the documented shape for a list endpoint — stayed invisible to
 * the component-uniqueness assertion and reproduced the collision the
 * assertion exists to stop.
 */
export function nameGeneratedDto<T extends object>(
  cls: Type<T>,
  name: string,
): Type<T> {
  Object.defineProperty(cls, 'name', { value: name });
  Object.defineProperty(cls, ROCKETS_GENERATED_DTO_NAME, {
    value: true,
    enumerable: false,
  });
  return cls;
}

/**
 * DTO classes come straight from `nestjs-zod`'s `createZodDto` — no
 * custom decorator compilation:
 * - Swagger reads the static `_OPENAPI_METADATA_FACTORY` (zod v4's own
 *   `z.toJSONSchema`), the same hook the `@nestjs/swagger` CLI plugin
 *   targets. Apply `cleanupOpenApiDoc` to the built document.
 * - rockets-crud detects the static `schema` (Standard Schema) and
 *   validates bodies with the source zod schema — including rules
 *   class-validator cannot express (`.refine()`, coercions).
 * - Responses flow through the SAME class-transformer interceptor as
 *   handwritten resources, so the class carries the project DTO idiom
 *   (class-level `@Exclude` + per-field `@Expose`, `@Type` for nested
 *   relation projections) — that is what strips write-only fields from
 *   responses with full defineResource parity.
 * Only the class NAME is set here, so Swagger components match the
 * handwritten naming convention.
 */
export function compileDtoClass(
  schema: z.ZodObject,
  name: string,
  nested?: Readonly<Record<string, Type<object>>>,
): Type<object> {
  const cls = nameGeneratedDto(createZodDto(schema), name);
  Exclude()(cls);
  const proto: object = cls.prototype;
  for (const [key, field] of Object.entries(schema.shape)) {
    Expose()(proto, key);
    const nestedClass = nested?.[key];
    if (nestedClass !== undefined) {
      TransformType(() => nestedClass)(proto, key);
      continue;
    }
    const { base, meta } = unwrapField(field, `${name}.${key}`);
    const compute = meta.compute;
    if (compute !== undefined) {
      // The compute result is stripped to the DECLARED shape at runtime.
      // Without this the schema-level projection (which removes
      // `dto: { response: false }` columns from the documented shape) is
      // documentation only: whatever the compute callback returns —
      // including hidden columns of rows it embeds — would serialize
      // verbatim, because `toPlain` for this key is expose-all.
      Transform(
        ({ obj }: { obj: Record<string, unknown> }) =>
          stripToDeclaredShape(field, compute(obj)),
        { toClassOnly: true },
      )(proto, key);
      continue;
    }
    if (
      base instanceof z.ZodRecord ||
      base instanceof z.ZodObject ||
      base instanceof z.ZodUnknown ||
      base instanceof z.ZodAny
    ) {
      const raw = ({ obj }: { obj: Record<string, unknown> }): unknown =>
        obj?.[key];
      Transform(raw, { toClassOnly: true })(proto, key);
      Transform(raw, { toPlainOnly: true })(proto, key);
    }
  }
  attachOperationDtoOpenApiFields(
    cls,
    Object.entries(schema.shape).map(([fieldName, field]) => ({
      name: fieldName,
      required: !isOptionalZodField(field),
      schema: openApiSchemaFromZodField(field),
    })),
  );
  return cls;
}

/**
 * Key-level runtime strip: keep only the keys the declared (already
 * response-projected) schema names, recursing through arrays, objects and
 * Optional/Nullable/Default wrappers. Deliberately NOT `schema.parse` —
 * computed values routinely differ from the wire types in benign ways
 * (`Date` instances where the schema documents ISO strings), and full
 * validation would reject them. Undeclared keys never pass; value types
 * are the compute callback's contract.
 */
function stripToDeclaredShape(schema: z.ZodType, value: unknown): unknown {
  let current: z.ZodType = schema;
  for (;;) {
    if (current instanceof z.ZodOptional || current instanceof z.ZodNullable) {
      current = asClassicSchema(current.unwrap(), 'stripToDeclaredShape');
      continue;
    }
    if (current instanceof z.ZodDefault) {
      current = asClassicSchema(current.def.innerType, 'stripToDeclaredShape');
      continue;
    }
    break;
  }

  if (current instanceof z.ZodArray && Array.isArray(value)) {
    const element = asClassicSchema(current.element, 'stripToDeclaredShape');
    return value.map((item) => stripToDeclaredShape(element, item));
  }
  if (
    current instanceof z.ZodObject &&
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  ) {
    const source = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, field] of Object.entries(current.shape)) {
      if (key in source) {
        result[key] = stripToDeclaredShape(field, source[key]);
      }
    }
    return result;
  }
  return value;
}

export function namedZodDto<T>(schema: z.ZodObject, name: string): Type<T> {
  const cls = nameGeneratedDto(createZodDto(schema), name);
  // `createZodDto` returns the same runtime constructor described by `Type<T>`;
  // only its generic instance type remains tied to the concrete schema. The
  // caller's `T` is the structurally matching public DTO contract, so this cast
  // restores that erased Nest constructor type without changing runtime data.
  return cls as unknown as Type<T>;
}
