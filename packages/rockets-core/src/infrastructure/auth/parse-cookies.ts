import type { AuthRequest } from '../../domain/interfaces/auth-adapter.interface';

/**
 * Parses an HTTP `Cookie` header into a plain key→value map. `AuthRequest`
 * carries the raw header, not a pre-parsed jar — cookie parsing is
 * adapter-specific enough (encoding, duplicate names) that core exposes
 * this as one shared implementation instead of every cookie-based
 * adapter (session cookies, CSRF) writing its own.
 *
 * Malformed segments (no `=`, an empty name) are skipped rather than
 * thrown on — a stray non-cookie value ahead of the one an adapter wants
 * should not 500 the request.
 *
 * **Duplicate names resolve FIRST-wins**, matching the `cookie` npm
 * package that Express, Fastify, and effectively every other Node cookie
 * reader is built on (`cookie.parse('a=1; a=2')` → `{ a: '1' }`). This
 * is a security property, not a style choice: an attacker who can plant
 * a second `__session` cookie — cookie tossing from a sibling subdomain,
 * or a more specific path scope — makes a last-wins parser disagree with
 * every first-wins layer in the same stack about WHICH session is
 * authenticated. Two layers of one app resolving the same request to two
 * different users is the bug; agreeing with the ecosystem removes it.
 */
export function parseCookies(
  header: string | readonly string[] | undefined,
): Readonly<Record<string, string>> {
  // Null-prototype on EVERY return path, the empty one included. A
  // plain `{}` here would make `parseCookies(undefined)['constructor']`
  // a Function, so `extractCookie` — declared `string | null` — could
  // hand a callers a function for a request that carried no Cookie
  // header at all.
  if (header === undefined) return Object.create(null);
  const raw = Array.isArray(header) ? header.join('; ') : (header as string);

  // Same reason: cookie names come straight off the wire, and a plain
  // `{}` both inherits `Object.prototype` keys (breaking the first-wins
  // `in` check for a cookie named `toString`) and swallows a cookie
  // literally named `__proto__` on assignment.
  const cookies: Record<string, string> = Object.create(null);
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name.length === 0) continue;
    if (name in cookies) continue;
    const rawValue = part.slice(eq + 1).trim();
    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch {
      // Not URI-encoded (or malformed encoding) — the raw value is still
      // usable; failing the whole parse over one bad cookie is worse.
      cookies[name] = rawValue;
    }
  }
  return cookies;
}

/**
 * Reads one named cookie off an {@link AuthRequest}. Use this inside
 * `authenticate()` implementations that read a session cookie:
 *
 * ```ts
 * async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
 *   const cookie = extractCookie(request, '__session');
 *   if (cookie === null) return { matched: false };
 *   // … verify the session cookie …
 * }
 * ```
 */
export function extractCookie(
  request: AuthRequest,
  name: string,
): string | null {
  const cookies = parseCookies(request.headers['cookie']);
  const value = cookies[name];
  return value !== undefined && value.length > 0 ? value : null;
}
