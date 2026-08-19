import type { ClassTransformOptions } from 'class-transformer';
import { Transform } from 'class-transformer';

/**
 * Transform options for the request-body ValidationPipe.
 *
 * This is where the free-form JSON loss actually happens (#68). The
 * upstream default pipe options carry `strategy: 'excludeAll'`, and
 * `excludeAll` is RECURSIVE: transforming the request body into the
 * create DTO walks into a plain-object property, finds no `@Expose`
 * metadata for its keys, and yields `{}`. The blob is destroyed before
 * the row is written — the database stores `{}`, so no response-side
 * change can bring it back.
 *
 * `excludeExtraneousValues: true` alone does the job the whitelist is
 * actually for: an undeclared top-level key is still dropped, and a
 * nested property typed with `@Type(() => ChildDto)` is still projected
 * to the child's exposed fields. Only the free-form case differs.
 */
export const ROCKETS_VALIDATION_TRANSFORM_OPTIONS: ClassTransformOptions = {
  excludeExtraneousValues: true,
  excludePrefixes: ['_', '__'],
};

/**
 * Inbound transform options for the CRUD serialize interceptor.
 *
 * Upstream pairs `strategy: 'excludeAll'` with
 * `excludeExtraneousValues: true`. This deliberately omits the first,
 * because the two are not equivalent and only one of them is needed:
 *
 * | option | free-form blob | undeclared key |
 * |---|---|---|
 * | `excludeExtraneousValues` | preserved | dropped |
 * | `strategy: 'excludeAll'` | **`{}`** | dropped |
 *
 * `excludeAll` is recursive: it walks into a plain-object property,
 * finds no per-key `@Expose`, and yields `{}`. `excludeExtraneousValues`
 * alone still drops an undeclared top-level key AND still projects a
 * nested `@Type(() => ChildDto)` property to the child's exposed fields
 * — verified against both — so the whitelist is intact and free-form
 * JSON survives.
 *
 * Both sets are passed to `CrudModule.forRoot` because the settings
 * provider REPLACES the default object rather than merging into it
 * (`createSettingsProvider`: `effectiveSettings ?? defaultSettings`).
 */
export const ROCKETS_TO_INSTANCE_OPTIONS: ClassTransformOptions = {
  excludeExtraneousValues: true,
  excludePrefixes: ['_', '__'],
};

export const ROCKETS_TO_PLAIN_OPTIONS: ClassTransformOptions = {
  strategy: 'exposeAll',
  excludeExtraneousValues: false,
  excludePrefixes: ['_', '__'],
};

/**
 * Marks a response-DTO property as a free-form JSON value that must be
 * passed through untouched.
 *
 * ## Why this is needed
 *
 * The inbound whitelist (`excludeAll` + `excludeExtraneousValues`) is
 * what makes a response DTO a projection, and it is not negotiable. But
 * `plainToInstance` applies it RECURSIVELY: it walks into the value of a
 * plain-object property, finds no `@Expose` metadata for its keys, and
 * yields `{}`. A settings blob, a flexible profile or a widget config is
 * therefore emptied before serialization even begins — which is why
 * relaxing only the outbound options cannot fix it.
 *
 * This reads the value straight off the source object in both
 * directions, so the blob bypasses the recursive walk while every other
 * property keeps the projection.
 *
 * ## Why it is opt-in
 *
 * Core cannot tell a free-form blob from a nested projection it should
 * enforce. Both are plain objects, and distinguishing them means reading
 * `@Type()` metadata out of `class-transformer`'s internal storage —
 * undocumented, and wrong on a property that genuinely wants nested
 * projection would leak the child's hidden fields. The knowledge lives
 * with the DTO, so the declaration does too.
 *
 * The zod path needs no equivalent: it compiles DTOs from a schema, so
 * it can see that a field is `ZodRecord` / `ZodUnknown` / `ZodAny` and
 * applies the same transform itself.
 *
 * @example
 * ```ts
 * class PetResponseDto {
 *   @Expose() @ApiProperty() id!: string;
 *
 *   @Expose()
 *   @FreeFormJson()
 *   @ApiPropertyOptional({ type: 'object', additionalProperties: true })
 *   profile?: Record<string, unknown>;
 * }
 * ```
 */
export function FreeFormJson(): PropertyDecorator {
  return (target, propertyKey) => {
    const read = ({ obj }: { obj: Record<PropertyKey, unknown> }): unknown =>
      obj?.[propertyKey];
    Transform(read, { toClassOnly: true })(target, propertyKey);
    Transform(read, { toPlainOnly: true })(target, propertyKey);
  };
}
