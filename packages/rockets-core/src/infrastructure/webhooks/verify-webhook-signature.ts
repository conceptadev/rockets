import { createHmac, timingSafeEqual } from 'node:crypto';

export interface VerifyWebhookSignatureOptions {
  /**
   * The EXACT bytes the provider signed — the parsed/re-serialized JSON
   * body will not match, since re-serialization is not guaranteed
   * byte-identical to what was sent. Needs `rawBody: true` passed to
   * `NestFactory.create` and read off `ctx.request.raw` (Nest attaches
   * it as `req.rawBody`). See `CONFIGURATION.md` §6e.
   */
  readonly payload: Buffer | string;
  /** The signature header value, hex-encoded. */
  readonly signature: string;
  readonly secret: string;
  /** HMAC algorithm the provider signs with. Defaults to `'sha256'`. */
  readonly algorithm?: string;
  /**
   * Providers that prefix the header (GitHub: `"sha256=…"`, Stripe-style
   * schemes with a version tag) — stripped before comparing.
   */
  readonly prefix?: string;
}

/**
 * Verifies an inbound webhook's HMAC signature against the raw request
 * body (issue #59). Timing-safe on purpose: a naive `===` string compare
 * leaks how many leading bytes matched through response-time variance,
 * which is a real (if slow) way to forge a signature byte-by-byte.
 *
 * Not a hook interface — a plain function. The issue's own non-goal is
 * vendor packs in core; this is the one piece EVERY HMAC-based provider
 * needs (GitHub, Stripe, and most others sign the same way), so it earns
 * its place without becoming provider-specific.
 */
export function verifyWebhookSignature(
  options: VerifyWebhookSignatureOptions,
): boolean {
  const { payload, signature, secret, algorithm = 'sha256', prefix } = options;
  const provided =
    prefix !== undefined && signature.startsWith(prefix)
      ? signature.slice(prefix.length)
      : signature;

  let providedBuf: Buffer;
  let expectedBuf: Buffer;
  try {
    providedBuf = Buffer.from(provided, 'hex');
    expectedBuf = Buffer.from(
      createHmac(algorithm, secret).update(payload).digest('hex'),
      'hex',
    );
  } catch {
    // A malformed header (odd hex length, invalid chars) is "not a
    // match," not a crash.
    return false;
  }

  // `timingSafeEqual` throws on a length mismatch rather than returning
  // `false` — an attacker-controlled header must never reach it unguarded.
  if (providedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(providedBuf, expectedBuf);
}
