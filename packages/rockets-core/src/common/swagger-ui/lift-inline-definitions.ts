import type { OpenAPIObject } from '@nestjs/swagger';

const HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
] as const;

const REF_PREFIXES = ['#/definitions/', '#/$defs/'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Rewrites JSON-Schema-style local refs (`#/definitions/X`, `#/$defs/X`)
 * to OpenAPI component refs, recursively.
 */
function rewriteRefs(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(rewriteRefs);
  if (!isRecord(value)) return value;
  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key === '$ref' && typeof entry === 'string') {
      const prefix = REF_PREFIXES.find((candidate) =>
        entry.startsWith(candidate),
      );
      out[key] =
        prefix === undefined
          ? entry
          : `#/components/schemas/${entry.slice(prefix.length)}`;
      continue;
    }
    out[key] = rewriteRefs(entry);
  }
  return out;
}

/**
 * Lifts the `definitions` / `$defs` a request-body schema carries into
 * `components.schemas` and rewrites its refs, so the served document has
 * no dangling `#/definitions/<id>` pointer.
 *
 * Why this exists: upstream `@concepta/nestjs-crud` stamps generated CRUD
 * request bodies as an inline `ApiBody({ schema })` built straight from the
 * schema's JSON Schema bridge, bypassing the document converter that lifts
 * nested named schemas for every other route. A body that nests a named
 * schema (an admin user update carrying the app's `UserMetadataUpdateDto`)
 * therefore arrives with a raw `definitions` block. Responses and
 * hand-written `@Body({ schema })` routes never hit this path.
 *
 * An id already present in `components.schemas` is kept as is — the
 * converter's registration is authoritative, and a nested copy is the same
 * schema documented from the input side.
 */
export function liftInlineRequestBodyDefinitions(
  document: OpenAPIObject,
): OpenAPIObject {
  const components = document.components ?? {};
  const schemas = components.schemas ?? {};
  let touched = false;

  for (const pathItem of Object.values(document.paths ?? {})) {
    if (!isRecord(pathItem)) continue;
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!isRecord(operation)) continue;
      const requestBody = operation.requestBody;
      if (!isRecord(requestBody) || !isRecord(requestBody.content)) continue;
      for (const media of Object.values(requestBody.content)) {
        if (!isRecord(media) || !isRecord(media.schema)) continue;
        const { definitions, $defs, ...rest } = media.schema;
        const nested = {
          ...(isRecord($defs) ? $defs : {}),
          ...(isRecord(definitions) ? definitions : {}),
        };
        if (Object.keys(nested).length === 0) continue;
        for (const [id, definition] of Object.entries(nested)) {
          if (schemas[id] === undefined) {
            schemas[id] = rewriteRefs(definition) as (typeof schemas)[string];
          }
        }
        media.schema = rewriteRefs(rest) as typeof media.schema;
        touched = true;
      }
    }
  }

  if (!touched) return document;
  return { ...document, components: { ...components, schemas } };
}
