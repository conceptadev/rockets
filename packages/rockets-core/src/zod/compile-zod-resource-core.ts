import type { PlainLiteralObject, Type } from '@nestjs/common';
import { z } from 'zod';
import type {
  ResourceOperationsObject,
  ResourceRelationEntry,
  RocketsResourceDefinition,
  SchemaEntityCompiler,
} from '../index';
import { compileZodEntity } from './compile-zod-entity';
import { compileDtoClass } from './zod-dto';
import {
  normalizeOperations,
  opConfig,
  type ZodCrudOperation,
  type ZodOperationSchemas,
  zodOpConfig,
  type ZodResourceOperations,
} from './zod-operations';
import { hasDeletedAtField, projectSchema } from './zod-projections';
import { resolveOwnerColumns } from './zod-resource-composition';
import type { ZodOwnerConfig, ZodResourceDtos } from './zod-resource-contracts';

export interface ZodCoreInput {
  readonly name: string;
  readonly schema: z.ZodObject;
  readonly entity?: Type<PlainLiteralObject>;
  readonly table?: string;
  readonly operations?: readonly ZodCrudOperation[] | ZodResourceOperations;
  readonly owner?: string | ZodOwnerConfig;
  readonly entityCompiler?: SchemaEntityCompiler;
  readonly repository?: RocketsResourceDefinition<PlainLiteralObject>['repository'];
}

export interface CompiledZodCore {
  readonly entity: Type<PlainLiteralObject>;
  readonly operations: ResourceOperationsObject;
  readonly relations: ReadonlyArray<ResourceRelationEntry<PlainLiteralObject>>;
  readonly dtos: ZodResourceDtos;
  readonly ownerColumns: string[];
}

export function compileZodCore(input: ZodCoreInput): CompiledZodCore {
  const { name, schema, entity: entityOverride } = input;
  const entity = compileZodEntity(input, 'zodResource');

  const ops = normalizeOperations(input.operations);
  const enabled = (op: ZodCrudOperation): boolean =>
    ops[op] !== undefined && ops[op] !== false;

  // Declaring an override on an operation left out of `operations` is
  // not reachable: any config object enables its operation.
  const overrides = resolveOperationOverrides(name, ops);
  const overrideDto = (
    op: ZodCrudOperation,
    kind: 'Input' | 'Output',
  ): Type<object> | undefined => {
    const schema = overrides[op]?.[kind === 'Input' ? 'input' : 'output'];
    return schema === undefined
      ? undefined
      : compileDtoClass(schema, `${name}${pascal(op)}${kind}Dto`);
  };

  const ownerColumns = resolveOwnerColumns(schema, name, input.owner);
  const projections = projectSchema(
    name,
    schema,
    entity,
    new Set(ownerColumns),
  );

  // An `input` override supplies the whole request body, so the derived
  // create projection being empty is no longer a dead end.
  const derivedBodyOps = (['create', 'replace'] as const).filter(
    (op) => enabled(op) && overrides[op]?.input === undefined,
  );
  if (
    derivedBodyOps.length > 0 &&
    Object.keys(projections.create).length === 0
  ) {
    throw new Error(
      `[zodResource] "${name}" enables create/replace but every field is ` +
        'excluded from the create projection (db-generated or ' +
        'dto.create: false) — nothing would be writable.',
    );
  }
  if (
    (enabled('update') || enabled('replace')) &&
    projections.pkKey === undefined
  ) {
    throw new Error(
      `[zodResource] "${name}" enables update/replace but no field is ` +
        'marked { db: { pk: true } }.',
    );
  }
  const deleteConfig = opConfig(ops.delete);
  if (
    'soft' in deleteConfig &&
    deleteConfig.soft === true &&
    entityOverride === undefined &&
    !hasDeletedAtField(schema)
  ) {
    throw new Error(
      `[zodResource] "${name}" enables delete: { soft: true } but no field ` +
        'is marked { db: { deletedAt: true } } — the generated entity would ' +
        'have no delete-date column and soft removal would fail at runtime.',
    );
  }

  const responseNested = Object.fromEntries(
    Object.entries(projections.responseNested).map(([property, shape]) => [
      property,
      compileDtoClass(shape, `${name}${pascal(property)}ResponseDto`),
    ]),
  );
  const response = compileDtoClass(
    z.object(projections.response),
    `${name}ResponseDto`,
    responseNested,
  );
  const create = enabled('create')
    ? overrideDto('create', 'Input') ??
      compileDtoClass(z.object(projections.create), `${name}CreateDto`)
    : undefined;
  const update = enabled('update')
    ? overrideDto('update', 'Input') ??
      compileDtoClass(z.object(projections.update), `${name}UpdateDto`)
    : undefined;
  const replace = enabled('replace')
    ? overrideDto('replace', 'Input') ??
      compileDtoClass(z.object(projections.create), `${name}ReplaceDto`)
    : undefined;

  // Per-operation response override; falls back to the single projected
  // response DTO the whole resource shares.
  const responseFor = (op: ZodCrudOperation): Type<object> =>
    overrideDto(op, 'Output') ?? response;

  const operations: ResourceOperationsObject = {
    ...(enabled('list')
      ? { list: { ...zodOpConfig(ops.list), output: responseFor('list') } }
      : {}),
    ...(enabled('read')
      ? { read: { ...zodOpConfig(ops.read), output: responseFor('read') } }
      : {}),
    ...(enabled('create') && create !== undefined
      ? {
          create: {
            ...zodOpConfig(ops.create),
            input: create,
            output: responseFor('create'),
          },
        }
      : {}),
    ...(enabled('update') && update !== undefined
      ? {
          update: {
            ...zodOpConfig(ops.update),
            input: update,
            output: responseFor('update'),
          },
        }
      : {}),
    ...(enabled('replace') && replace !== undefined
      ? {
          replace: {
            ...zodOpConfig(ops.replace),
            input: replace,
            output: responseFor('replace'),
          },
        }
      : {}),
    ...(enabled('delete')
      ? {
          delete: {
            ...zodOpConfig(ops.delete),
            ...(overrides.delete?.output
              ? { output: responseFor('delete') }
              : {}),
          },
        }
      : {}),
    ...(enabled('restore')
      ? {
          restore: {
            ...zodOpConfig(ops.restore),
            ...(overrides.restore?.output
              ? { output: responseFor('restore') }
              : {}),
          },
        }
      : {}),
  };

  return {
    entity,
    operations,
    relations: projections.relations,
    dtos: { response, create, update, replace },
    ownerColumns,
  };
}

/**
 * Operations that carry a request body. `input` anywhere else is a
 * mistake core would silently drop.
 */
const BODY_OPERATIONS: ReadonlySet<ZodCrudOperation> = new Set([
  'create',
  'update',
  'replace',
]);

/**
 * Reads the per-operation `input` / `output` schema overrides and fails
 * fast on the combinations core cannot honour. Silently ignoring an
 * override is exactly the failure mode this layer exists to prevent:
 * the app believes it controls the contract, the wire says otherwise,
 * and the test suite stays green.
 */
function resolveOperationOverrides(
  name: string,
  ops: ZodResourceOperations,
): Readonly<Partial<Record<ZodCrudOperation, ZodOperationSchemas>>> {
  const resolved: Partial<Record<ZodCrudOperation, ZodOperationSchemas>> = {};

  for (const op of ALL_OPERATIONS) {
    const config = opConfig(ops[op]);
    const { input, output } = config;
    if (input === undefined && output === undefined) continue;

    if (input !== undefined && !BODY_OPERATIONS.has(op)) {
      throw new Error(
        `[zodResource] "${name}" declares an \`input\` schema on "${op}", ` +
          'which has no request body. Only create/update/replace accept one.',
      );
    }
    if (output !== undefined && op === 'delete') {
      const softReturns =
        'soft' in config &&
        config.soft === true &&
        'returnDeleted' in config &&
        config.returnDeleted === true;
      if (!softReturns) {
        throw new Error(
          `[zodResource] "${name}" declares an \`output\` schema on ` +
            '"delete" without `soft: true` + `returnDeleted: true` — the ' +
            'route answers 204 and the schema would never be serialized.',
        );
      }
    }
    if (output !== undefined && op === 'restore') {
      const restoreReturns =
        'returnRestored' in config && config.returnRestored === true;
      if (!restoreReturns) {
        throw new Error(
          `[zodResource] "${name}" declares an \`output\` schema on ` +
            '"restore" without `returnRestored: true` — the route answers ' +
            '204 and the schema would never be serialized.',
        );
      }
    }

    resolved[op] = { input, output };
  }

  return resolved;
}

const ALL_OPERATIONS: readonly ZodCrudOperation[] = [
  'list',
  'read',
  'create',
  'update',
  'replace',
  'delete',
  'restore',
];

function pascal(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
