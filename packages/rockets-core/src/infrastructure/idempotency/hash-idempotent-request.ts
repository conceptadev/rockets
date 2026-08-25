import { createHash } from 'node:crypto';

/**
 * Stable hash of a request body for idempotency conflict detection
 * (issue #59). Object keys are sorted recursively before stringifying —
 * plain `JSON.stringify` preserves insertion order, so the SAME logical
 * body sent with keys in a different order would otherwise hash
 * differently and produce a false conflict.
 *
 * The documented usage hashes `ctx.input`, i.e. the POST-VALIDATION
 * value: a `z.coerce.date()` field is a real `Date` by then, not the
 * string the client sent. So the walker must handle more than plain
 * JSON — anything it cannot represent FAITHFULLY it throws on, because
 * the failure mode of a lossy fallback is silent and severe: two
 * different requests that hash the same replay each other's stored
 * response under one idempotency key. (An earlier version walked a
 * `Date` through the generic-object branch, where `Object.keys(date)`
 * is `[]`, so EVERY date serialised to `{}`.)
 *
 * Representable: `null`, booleans, finite numbers, strings, bigints,
 * arrays, plain objects, `Map`, `Set`, and any object exposing
 * `toJSON()` (`Date`, `Buffer`, `URL`, …).
 *
 * @throws Error when the value contains something with no faithful
 * representation (a class instance without `toJSON()`, a function, a
 * symbol, `undefined` at the root, `NaN`/`Infinity`). The message names
 * the offending path.
 */
export function hashIdempotentRequest(value: unknown): string {
  return createHash('sha256')
    .update(stableStringify(value, '$', 0, new Set()))
    .digest('hex');
}

/**
 * Depth ceiling. A ~10KB body can nest thousands deep, and an
 * unbounded recursive walker answers that with a `RangeError` — a 500
 * from a stack overflow, on a value a client controls, wherever the
 * schema admits free-form JSON (`z.unknown()`, `z.record()`). The cap
 * fails the same way every other unrepresentable value does: a named
 * error, not a crash. Far deeper than any real request body.
 */
const MAX_DEPTH = 200;

function unrepresentable(path: string, description: string): Error {
  return new Error(
    `hashIdempotentRequest: cannot hash ${description} at "${path}". ` +
      `Hashing it as a placeholder would make two DIFFERENT requests ` +
      `hash identically, so an idempotent replay would return the wrong ` +
      `stored response. Give the value a toJSON(), or hash a plain-object ` +
      `projection of the request instead.`,
  );
}

/**
 * Whether a value is a plain JSON object (as opposed to a class
 * instance). Prototype-checked, the same test the operation-resource
 * input guard uses: a class instance is NOT a record whose own keys
 * describe it, which is exactly the `Date` trap above.
 */
function isPlainObject(value: object): boolean {
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function hasToJson(value: object): value is { toJSON(): unknown } {
  return typeof (value as { toJSON?: unknown }).toJSON === 'function';
}

/**
 * Serialises one value. `seen` holds the objects on the CURRENT branch,
 * so a cycle (or a `toJSON()` that returns its own receiver) is
 * reported instead of overflowing the stack; `depth` bounds the walk.
 */
function stableStringify(
  value: unknown,
  path: string,
  depth: number,
  seen: Set<object>,
): string {
  if (value === null) return 'null';

  switch (typeof value) {
    case 'string':
    case 'boolean':
      return JSON.stringify(value);
    case 'number':
      if (!Number.isFinite(value)) {
        throw unrepresentable(path, `the non-finite number ${String(value)}`);
      }
      return JSON.stringify(value);
    case 'bigint':
      // Tagged so 1n and "1" and 1 cannot collide. `JSON.stringify`
      // throws on a bigint, so this branch is the only way a
      // `z.bigint()` field reaches a hash at all.
      return `bigint(${value.toString()})`;
    case 'undefined':
      throw unrepresentable(path, 'undefined');
    case 'function':
      throw unrepresentable(path, 'a function');
    case 'symbol':
      throw unrepresentable(path, 'a symbol');
    default:
      break;
  }

  const object: object = value as object;

  if (depth > MAX_DEPTH) {
    throw unrepresentable(path, `a value nested deeper than ${MAX_DEPTH}`);
  }
  if (seen.has(object)) {
    throw unrepresentable(path, 'a circular reference');
  }
  seen.add(object);
  try {
    return stringifyObject(object, path, depth, seen);
  } finally {
    // Removed on the way out: the SAME object appearing twice in
    // sibling positions is not a cycle, and rejecting it would break
    // an ordinary body that reuses one nested value.
    seen.delete(object);
  }
}

function constructorName(value: object): string | undefined {
  const name: unknown = value.constructor?.name;
  return typeof name === 'string' ? name : undefined;
}

function stringifyObject(
  object: object,
  path: string,
  depth: number,
  seen: Set<object>,
): string {
  if (Array.isArray(object)) {
    // A hole or an explicit `undefined` is `null` in JSON, and that is
    // what the client would have sent on the wire.
    return `[${object
      .map((item, index) =>
        item === undefined
          ? 'null'
          : stableStringify(item, `${path}[${index}]`, depth + 1, seen),
      )
      .join(',')}]`;
  }

  // BEFORE the generic-object branch: `Date`, `Buffer`, `URL` and
  // friends carry their identity in `toJSON()`, never in their own
  // enumerable keys.
  if (hasToJson(object)) {
    // TAGGED with the constructor name, for the same reason `bigint` is:
    // untagged, `new Date('2020-01-01T00:00:00.000Z')` and the ISO
    // STRING of that date produced one hash, so a schema accepting
    // either spelling of a field could not tell the two requests apart.
    return `${constructorName(object) ?? 'json'}(${stableStringify(
      object.toJSON(),
      path,
      depth + 1,
      seen,
    )})`;
  }

  if (object instanceof Map) {
    const entries = [...object.entries()].map(
      ([key, entryValue]) =>
        `${stableStringify(
          key,
          `${path}(key)`,
          depth + 1,
          seen,
        )}:${stableStringify(
          entryValue,
          `${path}.${String(key)}`,
          depth + 1,
          seen,
        )}`,
    );
    // Sorted for the same reason object keys are: a Map's insertion
    // order is not part of its value.
    return `Map{${entries.sort().join(',')}}`;
  }

  if (object instanceof Set) {
    const members = [...object.values()].map((member, index) =>
      stableStringify(member, `${path}[${index}]`, depth + 1, seen),
    );
    return `Set[${members.sort().join(',')}]`;
  }

  if (!isPlainObject(object)) {
    const name = constructorName(object);
    throw unrepresentable(
      path,
      name === undefined ? 'a non-plain object' : `a ${name} instance`,
    );
  }

  const record: Record<string, unknown> = object as Record<string, unknown>;
  const entries = Object.keys(record)
    .sort()
    // `JSON.stringify` DROPS an undefined-valued key, so `{ a: 1 }` and
    // `{ a: 1, b: undefined }` are the same body on the wire. Keeping
    // the key made them hash differently and 409 a legitimate retry.
    .filter((key) => record[key] !== undefined)
    .map(
      (key) =>
        `${JSON.stringify(key)}:${stableStringify(
          record[key],
          `${path}.${key}`,
          depth + 1,
          seen,
        )}`,
    );
  return `{${entries.join(',')}}`;
}
