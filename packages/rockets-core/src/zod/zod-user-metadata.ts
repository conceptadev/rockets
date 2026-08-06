import { z } from 'zod';
import type {
  RocketsUserMetadataConfig,
  SchemaEntityCompiler,
  UserMetadataCreatableInterface,
  UserMetadataModelUpdatableInterface,
} from '../index';
import { compileZodEntity } from './compile-zod-entity';
import { projectSchema } from './zod-projections';
import { compileDtoClass, namedZodDto } from './zod-dto';

/**
 * Persistence fields every userMetadata schema must declare — the zod
 * mirror of `BaseUserMetadataEntityInterface`. Presence is checked at
 * boot ({@link assertUserMetadataShape}); the create / update DTO
 * projections omit the server-managed subset of these.
 */
const USER_METADATA_BASE_FIELDS = [
  'id',
  'userId',
  'dateCreated',
  'dateUpdated',
  'dateDeleted',
  'version',
] as const;

/**
 * Server-managed columns, never writable through the API — enforced on top
 * of the projection so the guarantee holds even for a schema that declares
 * these fields as plain zod without `db` metadata.
 */
const CREATE_MANAGED_FIELDS = [
  'id',
  'dateCreated',
  'dateUpdated',
  'dateDeleted',
  'version',
] as const;

/** Update additionally freezes ownership. */
const UPDATE_MANAGED_FIELDS = [...CREATE_MANAGED_FIELDS, 'userId'] as const;

function omitKeys(
  shape: Record<string, z.ZodType>,
  keys: readonly string[],
): Record<string, z.ZodType> {
  return Object.fromEntries(
    Object.entries(shape).filter(([key]) => !keys.includes(key)),
  );
}

function pascalCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface ZodUserMetadataOptions {
  /** PascalCase base for generated class names. Default `'UserMetadata'`. */
  readonly name?: string;
  /** Physical table name. Default `'userMetadata'`. */
  readonly table?: string;
  /** Compiler for the entity class (usually the bound app default). */
  readonly entityCompiler?: SchemaEntityCompiler;
  /** Per-table adapter override forwarded to the userMetadata config. */
  readonly repository?: RocketsUserMetadataConfig['repository'];
}

function assertUserMetadataShape(schema: z.ZodObject, name: string): void {
  const missing = USER_METADATA_BASE_FIELDS.filter(
    (field) => !(field in schema.shape),
  );
  if (missing.length > 0) {
    throw new Error(
      `[defineZodUserMetadata] "${name}" schema is missing required ` +
        `userMetadata field(s): ${missing.join(', ')}. A userMetadata ` +
        'schema must declare id, userId, dateCreated, dateUpdated, ' +
        'dateDeleted and version (the BaseUserMetadataEntityInterface shape).',
    );
  }
}

/**
 * `zodResource` counterpart for the `userMetadata` config slot: a single
 * zod schema compiles into the entity + create / update / response DTO
 * quad that `RocketsModule` / `RocketsCoreModule` expect — no handwritten
 * entity or DTO classes.
 */
export function defineZodUserMetadata(
  schema: z.ZodObject,
  options: ZodUserMetadataOptions = {},
): RocketsUserMetadataConfig {
  const name = options.name ?? 'UserMetadata';
  const table = options.table ?? 'userMetadata';

  assertUserMetadataShape(schema, name);

  const entity = compileZodEntity(
    {
      name,
      schema,
      table,
      entityCompiler: options.entityCompiler,
      repository: options.repository,
    },
    'defineZodUserMetadata',
  );

  // Same projection pass `zodResource` uses. Before, this helper hand-rolled
  // its DTOs (`schema.omit(...)` + `compileDtoClass(schema)`), which made the
  // response DTO the ENTIRE schema — `dto: { response: false }` was silently
  // ignored and every userMetadata column reached the wire (CWE-200). Sharing
  // `projectSchema` means there is one projection path, not two to keep in
  // sync.
  const projections = projectSchema(name, schema, entity, new Set());

  const responseNested = Object.fromEntries(
    Object.entries(projections.responseNested).map(([property, shape]) => [
      property,
      compileDtoClass(shape, `${name}${pascalCase(property)}ResponseDto`),
    ]),
  );

  const createDto = namedZodDto<UserMetadataCreatableInterface>(
    z.object(omitKeys(projections.create, CREATE_MANAGED_FIELDS)),
    `${name}CreateDto`,
  );

  const updateDto = namedZodDto<UserMetadataModelUpdatableInterface>(
    z.object(omitKeys(projections.update, UPDATE_MANAGED_FIELDS)),
    `${name}UpdateDto`,
  );

  const responseDto = compileDtoClass(
    z.object(projections.response),
    `${name}ResponseDto`,
    responseNested,
  );

  return {
    entity,
    createDto,
    updateDto,
    responseDto,
    repository: options.repository,
  };
}
