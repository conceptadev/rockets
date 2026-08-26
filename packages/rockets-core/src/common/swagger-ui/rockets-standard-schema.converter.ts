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

export function createRocketsStandardSchemaConverter(): StandardSchemaConverter {
  const claims = new Map<string, ComponentClaim>();

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
    return {
      schema: { $ref: `#/components/schemas/${id}` },
      components: {
        ...(isRecord($defs) ? $defs : {}),
        ...(isRecord(definitions) ? definitions : {}),
        [id]: own,
      },
    };
  };
}
