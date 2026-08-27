import type { StandardSchemaConverter } from '@nestjs/swagger';
import { z } from 'zod';
import { readSchemaId } from '../utils/open-api-schema.util';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Document converter that turns every schema carrying an OpenAPI id
 * (`withOpenApi(schema, id)`) into a `$ref` to `components/schemas/<id>`,
 * so generated documents keep stable component names instead of inlining
 * the same shape into every route.
 *
 * One map per document: an id claimed by two DIFFERENT schema instances is
 * a boot error here rather than a silent last-wins overwrite. So is ONE
 * instance documented from both sides (`@Body({ schema })` and
 * `ApiResponse({ standardSchema })`): zod's input and output JSON Schemas
 * differ by construction (transforms, defaults become required,
 * `additionalProperties: false` on the output side), so one component
 * cannot describe a request and a response — the response gets its own
 * id. Nested named schemas arrive as `definitions` in the raw JSON Schema
 * and are lifted into `components` (Swagger rewrites `#/definitions/x`
 * refs).
 *
 * Deliberately not upstream's `withNamedComponent` registry: that one is
 * module-global and throws on the second registration of an id, which the
 * test suites (and any factory that compiles a resource more than once)
 * would trip over.
 */
interface ComponentClaim {
  readonly schema: z.ZodType;
  readonly side: 'input' | 'output';
}

/**
 * zod names a definition it had to extract but cannot name — the inner
 * object of a `z.lazy()` recursion is the common one — positionally, as
 * `__schema0`, `__schema1`, … The counter restarts for every schema
 * converted, so two unrelated recursive schemas in one document both ask
 * for `__schema0` and collide: before this rename the second one aborted
 * document generation with a shape-mismatch error that blamed the
 * request/response split instead of the name.
 *
 * Qualifying the name with the owning component id keeps it unique across
 * the document and derived only from that schema, so a component name
 * changes when its own schema changes and not because an unrelated
 * recursive schema was declared somewhere else.
 */
const ANONYMOUS_DEFINITION = /^__schema\d+$/u;

/**
 * `z.toJSONSchema` renders a discriminated union as a bare `oneOf`, losing
 * the one thing that makes it discriminated. A client generator reading
 * plain `oneOf` has to try each branch in turn instead of switching on the
 * tag, which is both slower and lossier than the tagged union the schema
 * describes.
 *
 * OpenAPI's `discriminator` only applies when every branch is a `$ref`, so
 * this is added exactly when the branches were named with `withOpenApi()`
 * and left inline otherwise. `mapping` is always written: without it the
 * spec's implicit mapping matches the tag value against the COMPONENT
 * name, and `'circle'` is not `'CircleDto'`.
 */
function readZodDef(schema: unknown): Record<string, unknown> | undefined {
  if (!isRecord(schema)) return undefined;
  const inner = schema['_zod'];
  const def = isRecord(inner) ? inner['def'] : schema['def'];
  return isRecord(def) ? def : undefined;
}

function discriminatorFor(
  schema: unknown,
): Record<string, unknown> | undefined {
  const def = readZodDef(schema);
  const propertyName = def?.['discriminator'];
  const options = def?.['options'];
  if (typeof propertyName !== 'string' || !Array.isArray(options)) {
    return undefined;
  }

  const mapping: Record<string, string> = {};
  for (const option of options) {
    // Every branch must be a named component: `discriminator` is only
    // legal over `$ref` branches, and a partial mapping would document
    // some tags while silently dropping the rest.
    const branchId =
      option instanceof z.ZodType ? readSchemaId(option) : undefined;
    if (branchId === undefined) {
      return undefined;
    }
    const shape = readZodDef(option)?.['shape'];
    const values = isRecord(shape)
      ? readZodDef(shape[propertyName])?.['values']
      : undefined;
    if (!Array.isArray(values)) {
      return undefined;
    }
    for (const value of values) {
      if (typeof value !== 'string') {
        return undefined;
      }
      mapping[value] = `#/components/schemas/${branchId}`;
    }
  }

  return { mapping, propertyName };
}

/**
 * Collects `id -> discriminator` for every named discriminated union
 * reachable from one converted schema, including the ones that only ever
 * appear as lifted definitions. A nested named schema never re-enters this
 * converter, so the union's zod node — the only place the tag property and
 * its literal values exist — is unreachable by the time its JSON Schema is
 * being emitted. Walking from the root once is what keeps them connected.
 */
function collectDiscriminators(
  schema: unknown,
  into: Map<string, Record<string, unknown>>,
  seen: Set<unknown>,
): void {
  if (!isRecord(schema) || seen.has(schema)) {
    return;
  }
  seen.add(schema);

  if (schema instanceof z.ZodType) {
    const id = readSchemaId(schema);
    const discriminator = discriminatorFor(schema);
    if (id !== undefined && discriminator !== undefined) {
      into.set(id, discriminator);
    }
  }

  const def = readZodDef(schema);
  if (def === undefined) {
    return;
  }
  for (const value of Object.values(def)) {
    if (Array.isArray(value)) {
      for (const entry of value) collectDiscriminators(entry, into, seen);
    } else if (isRecord(value)) {
      // `shape` is a plain record of fields, not a zod node — recursing
      // into its values covers both it and single-child defs alike.
      collectDiscriminators(value, into, seen);
      for (const entry of Object.values(value)) {
        collectDiscriminators(entry, into, seen);
      }
    }
  }
}

function qualifyAnonymousDefinitions(
  id: string,
  components: Record<string, unknown>,
): Record<string, unknown> {
  const renames = new Map<string, string>();
  for (const name of Object.keys(components)) {
    if (name !== id && ANONYMOUS_DEFINITION.test(name)) {
      renames.set(name, `${id}${name.replace(/^__schema/u, 'Ref')}`);
    }
  }
  if (renames.size === 0) {
    return components;
  }

  const rewriteRefs = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      return node.map(rewriteRefs);
    }
    if (!isRecord(node)) {
      return node;
    }
    const next: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string') {
        // The raw JSON Schema points at `#/$defs/x` or `#/definitions/x`;
        // Swagger rewrites those to `#/components/schemas/x` only after
        // this converter returns. Match every prefix and keep the one the
        // ref already used, so the rewrite is invisible downstream.
        const match =
          /^(#\/(?:\$defs|definitions|components\/schemas)\/)(.+)$/u.exec(
            value,
          );
        const renamed =
          match === undefined || match === null
            ? undefined
            : renames.get(match[2] as string);
        next[key] =
          renamed === undefined ? value : `${match?.[1] ?? ''}${renamed}`;
        continue;
      }
      next[key] = rewriteRefs(value);
    }
    return next;
  };

  const qualified: Record<string, unknown> = {};
  for (const [name, json] of Object.entries(components)) {
    qualified[renames.get(name) ?? name] = rewriteRefs(json);
  }
  return qualified;
}

export function createRocketsStandardSchemaConverter(): StandardSchemaConverter {
  const claims = new Map<string, ComponentClaim>();
  const emitted = new Map<string, string>();

  return (schema, { schemaType }) => {
    if (!(schema instanceof z.ZodType)) return undefined;
    const id = readSchemaId(schema);
    if (id === undefined) return undefined;

    const prior = claims.get(id);
    if (prior !== undefined && prior.schema !== schema) {
      throw new Error(
        `OpenAPI component "${id}" is claimed by two different schema ` +
          `instances in the same document. Reuse one instance, or give the ` +
          `second schema its own id.`,
      );
    }
    if (prior !== undefined && prior.side !== schemaType) {
      throw new Error(
        `OpenAPI component "${id}" is documented as both a request ` +
          `(input) and a response (output). A schema's input and output ` +
          `JSON Schemas differ, so one component cannot describe both — ` +
          `give the response side its own withOpenApi() id.`,
      );
    }
    claims.set(id, { schema, side: schemaType });

    const jsonSchema: unknown = Reflect.get(schema['~standard'], 'jsonSchema');
    const convert: unknown = isRecord(jsonSchema)
      ? jsonSchema[schemaType]
      : undefined;
    if (typeof convert !== 'function') {
      throw new Error(
        `OpenAPI component "${id}" has no JSON Schema bridge — wrap the ` +
          `schema LAST with withOpenApi().`,
      );
    }
    const raw: unknown = convert({ target: 'openapi-3.0' });
    if (!isRecord(raw)) return undefined;

    const { $defs, definitions, ...own } = raw;
    const components = qualifyAnonymousDefinitions(id, {
      ...(isRecord($defs) ? $defs : {}),
      ...(isRecord(definitions) ? definitions : {}),
      [id]: own,
    });

    // Matched by BRANCH SET, not by component name. The same union node is
    // reached under one id here and emitted under another as a lifted
    // definition (an operation's generated wrapper id over an authored
    // response id is the ordinary case), so keying on the id this call saw
    // attaches the discriminator to a component that does not exist.
    const discriminators = new Map<string, Record<string, unknown>>();
    collectDiscriminators(schema, discriminators, new Set());
    for (const discriminator of discriminators.values()) {
      const branches = Object.values(
        discriminator['mapping'] as Record<string, string>,
      );
      for (const [name, json] of Object.entries(components)) {
        if (!isRecord(json) || !Array.isArray(json['oneOf'])) continue;
        const refs = json['oneOf'].map((branch) =>
          isRecord(branch) && typeof branch['$ref'] === 'string'
            ? branch['$ref'].slice(branch['$ref'].lastIndexOf('/') + 1)
            : undefined,
        );
        const named = new Set(
          branches.map((r) => r.slice(r.lastIndexOf('/') + 1)),
        );
        if (
          refs.length === named.size &&
          refs.every((r) => r !== undefined && named.has(r))
        ) {
          components[name] = { ...json, discriminator };
        }
      }
    }
    // Nested named schemas never re-enter this converter — they arrive
    // as definitions of whichever schema embeds them. The same nested id
    // reached from a request and from a response carries two different
    // JSON Schemas (see above), and Swagger would keep whichever came
    // last. Compare every emitted component against what the document
    // already holds under that name.
    for (const [name, json] of Object.entries(components)) {
      const serialized = JSON.stringify(json);
      const previous = emitted.get(name);
      if (previous !== undefined && previous !== serialized) {
        throw new Error(
          `OpenAPI component "${name}" is emitted with two different shapes ` +
            `in the same document (reached through "${id}" as ${schemaType}). ` +
            `A nested named schema used on both the request and the ` +
            `response side needs one id per side.`,
        );
      }
      emitted.set(name, serialized);
    }
    return {
      schema: { $ref: `#/components/schemas/${id}` },
      components,
    };
  };
}
