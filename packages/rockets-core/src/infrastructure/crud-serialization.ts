import type { ClassTransformOptions } from 'class-transformer';
import { Transform } from 'class-transformer';

/**
 * Options for the CRUD serialize interceptor's `toInstance` step — the
 * one that builds the RESPONSE DTO from the entity. Despite the name,
 * this governs the outbound projection, not request parsing.
 *
 * Upstream pairs `strategy: 'excludeAll'` with
 * `excludeExtraneousValues: true`. This deliberately omits the first,
 * because the two are not equivalent and only one of them is needed:
 *
 * | option | free-form blob | column the DTO omits |
 * |---|---|---|
 * | `excludeExtraneousValues` | preserved | dropped |
 * | `strategy: 'excludeAll'` | **`{}`** | dropped |
 *
 * `excludeAll` is recursive: it walks into a plain-object property,
 * finds no per-key `@Expose`, and yields `{}`. `excludeExtraneousValues`
 * alone still drops a column the response DTO does not declare, which is
 * what makes the DTO a projection.
 *
 * Verified by flipping this flag: the projection test in
 * `rockets-core-json-column.e2e-spec.ts` fails, and only that one.
 * Request-side mass assignment is NOT governed here — it comes from the
 * ValidationPipe's `whitelist: true`, and stays closed with this flag
 * off. Do not treat this constant as an inbound security control.
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
 * Marks a DTO property as a free-form JSON value that must be passed
 * through untouched.
 *
 * Declare it on the INPUT DTO: that is where the value is destroyed.
 * The request-body pipe runs with the upstream `strategy: 'excludeAll'`
 * defaults, so an unmarked blob reaches the repository as `{}` and the
 * row is written empty — after which no response-side option can
 * recover it. Marking the response DTO as well is harmless and keeps
 * the two declarations symmetric.
 *
 * ## Why this is needed
 *
 * The whitelist (`excludeAll` + `excludeExtraneousValues`) is what makes
 * a DTO a projection, and it is not negotiable. But `plainToInstance`
 * applies it RECURSIVELY: it walks into the value of a
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
