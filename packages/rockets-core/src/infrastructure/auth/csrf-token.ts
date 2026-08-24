import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Signed double-submit CSRF token (issue #58): `HMAC(secret, sessionValue)`.
 * Binding the token to the session cookie's OWN value — rather than a
 * random token stored server-side — needs no extra state and, unlike a
 * bare random double-submit token, cannot be fixed by an attacker who can
 * set an unrelated cookie on a sibling subdomain (they would need the
 * session cookie's actual value, which cross-site JS cannot read).
 *
 * Mint this alongside the session cookie itself and hand it to the
 * client in a NON-httpOnly cookie or response field — the client must be
 * able to read it and echo it back in a header, which is the entire
 * point of the double-submit pattern. See `CONFIGURATION.md` §7c.
 */
export function generateCsrfToken(
  sessionValue: string,
  secret: string,
): string {
  return createHmac('sha256', secret).update(sessionValue).digest('hex');
}

/**
 * Verifies a CSRF token against the session value it should have been
 * derived from. Timing-safe: a naive `===` compare leaks how many
 * leading hex characters matched through response-time variance.
 */
export function verifyCsrfToken(
  token: string,
  sessionValue: string,
  secret: string,
): boolean {
  let provided: Buffer;
  let expected: Buffer;
  try {
    provided = Buffer.from(token, 'hex');
    expected = Buffer.from(generateCsrfToken(sessionValue, secret), 'hex');
  } catch {
    return false;
  }
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}
