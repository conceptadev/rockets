import { Allow } from 'class-validator';
import type { Type } from '@nestjs/common';
import type { StandardSchemaV1 } from '@standard-schema/spec';

import { getCarriedStandardSchema } from './schema';

/**
 * Makes a schema-carrying DTO survive `ValidationPipe({ whitelist: true })`
 * — anyone's, not just Rockets' own.
 *
 * The trap (issue #83): a DTO built from a schema carries no
 * class-validator metadata, and class-validator's whitelist strips every
 * undecorated property. The request is validated upstream by the schema
 * and then **emptied to `{}`** by the very pipe meant to protect it —
 * silently, with a `201` — which is worse than the loud manual-parse
 * failure it replaces. Stamping `@Allow()` on each declared key gives
 * the whitelist exactly what it wants while changing no validation
 * semantics: `Allow` asserts nothing.
 *
 * Keys come from the schema when it is introspectable (a zod object's
 * `.shape` — which covers every `createZodDto` / `compileDtoClass`
 * class), or from the explicit `keys` argument for opaque Standard
 * Schema vendors that expose only `~standard.validate`. Refusing to
 * guess is deliberate: stamping the wrong keys would punch holes in the
 * whitelist.
 */
export function allowStandardSchemaKeys<T extends Type<object>>(
  dto: T,
  keys?: readonly string[],
): T {
  const schema = getCarriedStandardSchema(dto);
  if (schema === undefined) {
    throw new Error(
      `allowStandardSchemaKeys(${dto.name}): the class carries no Standard ` +
        'Schema as its static `schema`.',
    );
  }
  const resolved = keys ?? shapeKeys(schema);
  if (resolved === undefined) {
    throw new Error(
      `allowStandardSchemaKeys(${dto.name}): the schema exposes no ` +
        'introspectable shape and no `keys` were given. Pass the declared ' +
        'top-level keys explicitly — stamping guessed keys would punch ' +
        'holes in the whitelist.',
    );
  }

  for (const key of resolved) {
    Allow()(dto.prototype as object, key);
  }
  return dto;
}

/**
 * Top-level keys of a zod-object-like schema; `undefined` when opaque.
 *
 * An OPEN object (`.catchall(...)` / `.passthrough()`) throws instead:
 * its schema declares arbitrary extra keys valid, and a stamp knows
 * only `.shape` — so the whitelist would strip keys the schema itself
 * accepts, reintroducing #83's silent loss THROUGH the fix. Callers
 * with an open schema use the aware pipe, which validates with the
 * schema and needs no stamp.
 */
function shapeKeys(schema: StandardSchemaV1): readonly string[] | undefined {
  const shape: unknown = Reflect.get(schema, 'shape');
  if (typeof shape !== 'object' || shape === null) {
    return undefined;
  }

  const def: unknown = Reflect.get(schema, 'def');
  const catchall: unknown =
    typeof def === 'object' && def !== null
      ? Reflect.get(def, 'catchall')
      : undefined;
  if (catchall !== undefined && catchall !== null) {
    throw new Error(
      'allowStandardSchemaKeys: this schema is OPEN (catchall/passthrough) ' +
        '— it declares arbitrary extra keys valid, and a key stamp would ' +
        'let the whitelist strip what the schema accepts. Use ' +
        'StandardSchemaAwareValidationPipe for open schemas, or pass ' +
        '`keys` explicitly if the top-level keys really are fixed.',
    );
  }
  return Object.keys(shape);
}
