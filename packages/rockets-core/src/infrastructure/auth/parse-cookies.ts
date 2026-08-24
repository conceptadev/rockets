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
 */
export function parseCookies(
  header: string | readonly string[] | undefined,
): Readonly<Record<string, string>> {
  if (header === undefined) return {};
  const raw = Array.isArray(header) ? header.join('; ') : (header as string);

  const cookies: Record<string, string> = {};
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name.length === 0) continue;
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
