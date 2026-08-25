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
 * The only shape `generateCsrfToken` ever mints: HMAC-SHA256 rendered as
 * hex, so exactly 64 hex characters and nothing else.
 */
const CSRF_TOKEN_PATTERN = /^[0-9a-f]{64}$/i;

/**
 * Verifies a CSRF token against the session value it should have been
 * derived from. Timing-safe: a naive `===` compare leaks how many
 * leading hex characters matched through response-time variance.
 *
 * The shape check is NOT decoration. `Buffer.from(s, 'hex')` does not
 * throw on malformed input — it decodes the leading valid pairs and
 * silently stops at the first character that is not hex. A token of
 * "64 correct hex chars + arbitrary garbage" therefore decoded to the
 * exact expected bytes and verified as VALID, accepting a token this
 * function never minted. Rejecting anything that is not precisely the
 * minted shape, before decoding, is what makes the contract true.
 */
export function verifyCsrfToken(
  token: string,
  sessionValue: string,
  secret: string,
): boolean {
  if (!CSRF_TOKEN_PATTERN.test(token)) return false;

  const provided = Buffer.from(token, 'hex');
  const expected = Buffer.from(generateCsrfToken(sessionValue, secret), 'hex');
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}
