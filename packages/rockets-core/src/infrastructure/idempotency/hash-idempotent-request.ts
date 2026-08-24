import { createHash } from 'node:crypto';

/**
 * Stable hash of a request body for idempotency conflict detection
 * (issue #59). Object keys are sorted recursively before stringifying —
 * plain `JSON.stringify` preserves insertion order, so the SAME logical
 * body sent with keys in a different order would otherwise hash
 * differently and produce a false conflict.
 */
export function hashIdempotentRequest(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    const entries = keys.map(
      (key) =>
        `${JSON.stringify(key)}:${stableStringify(
          (value as Record<string, unknown>)[key],
        )}`,
    );
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}
