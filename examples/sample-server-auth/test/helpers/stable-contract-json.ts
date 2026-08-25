type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Recursively sorts object keys. Array order is preserved — it is significant
 * in OpenAPI (`required`, `enum`, `parameters`, `allOf`).
 */
function canonicalize(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

/**
 * Serializes an OpenAPI document for byte-for-byte pinning, with object keys
 * in canonical (sorted) order.
 *
 * Key order carries no meaning in JSON or OpenAPI, but `SwaggerModule` builds
 * schema objects in whatever order its code paths happen to assign properties
 * — and that order is not stable across toolchains. The same
 * `/admin/audit-logs` enum parameter serializes as `{"type","enum"}` when the
 * app runs under vitest/swc and `{"enum","type"}` under ts-node/tsc. Pinning
 * raw `JSON.stringify` output therefore pins an artifact that reports drift
 * when nothing about the wire contract changed.
 *
 * Canonicalizing first makes the check answer the question it is actually
 * asking: did the API change?
 */
export function stableContractJson(document: object): string {
  const plain = JSON.parse(JSON.stringify(document)) as JsonValue;
  return `${JSON.stringify(canonicalize(plain), null, 2)}\n`;
}
