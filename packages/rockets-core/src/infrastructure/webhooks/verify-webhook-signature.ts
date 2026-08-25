import { createHmac, timingSafeEqual, type Hmac } from 'node:crypto';

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
  /** See {@link WebhookSignatureVerifierOptions.secret} — same contract. */
  readonly secret: string | undefined;
  /** HMAC algorithm the provider signs with. Defaults to `'sha256'`. */
  readonly algorithm?: string;
  /**
   * Providers that prefix the header (GitHub: `"sha256=…"`, Stripe-style
   * schemes with a version tag) — stripped before comparing.
   */
  readonly prefix?: string;
}

/** Config half of {@link VerifyWebhookSignatureOptions} — no per-request fields. */
export interface WebhookSignatureVerifierOptions {
  /**
   * `string | undefined` on purpose: the realistic source is
   * `process.env.WEBHOOK_SECRET`, and requiring `string` here is what
   * pushed every call site into a `!` assertion the type system cannot
   * check. Pass the env value straight through — an unset one fails the
   * BOOT here, loudly, instead of 401-ing every delivery in production.
   */
  readonly secret: string | undefined;
  /** HMAC algorithm the provider signs with. Defaults to `'sha256'`. */
  readonly algorithm?: string;
  /** See {@link VerifyWebhookSignatureOptions.prefix}. */
  readonly prefix?: string;
}

/** Bound verifier returned by {@link createWebhookSignatureVerifier}. */
export type WebhookSignatureVerifier = (
  payload: Buffer | string,
  signature: string,
) => boolean;

/**
 * Rejects a secret that cannot produce a valid signature.
 *
 * THROWS rather than returning "not a match". An unset env var is a
 * deployment fault, not a forged request: answering it with `false`
 * means every legitimate delivery 401s forever, silently, with nothing
 * in the logs pointing at the config. Use
 * {@link createWebhookSignatureVerifier} to hit this check at
 * module-init time so the app refuses to boot instead.
 */
function assertSecret(secret: unknown): asserts secret is string {
  // `unknown`, not `string`: the declared type allows `undefined`
  // precisely because the documented source is `process.env.X`. This is
  // the boundary where an unset variable is caught.
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error(
      'verifyWebhookSignature: `secret` must be a non-empty string. An ' +
        'empty or missing secret cannot verify anything — check the ' +
        'environment variable it is read from.',
    );
  }
}

/**
 * Secret AND algorithm — the boot-time check. Constructing one HMAC
 * proves the algorithm is supported; it is discarded, which is why this
 * runs once in {@link createWebhookSignatureVerifier} and not per
 * request (the request path gets its algorithm fault from the real
 * `startHmac` call instead).
 */
function assertVerifierConfig(
  secret: unknown,
  algorithm: string,
): asserts secret is string {
  assertSecret(secret);
  startHmac(algorithm, secret);
}

/**
 * `createHmac`, with the algorithm fault rethrown under a message that
 * names the option. Never swallowed: upstream's own text ("Digest method
 * not supported") identifies neither the option nor its value.
 */
function startHmac(algorithm: string, secret: string): Hmac {
  try {
    return createHmac(algorithm, secret);
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new Error(
      `verifyWebhookSignature: unsupported HMAC algorithm "${algorithm}" (${reason}).`,
    );
  }
}

/**
 * Whether a header value is a well-formed hex digest.
 *
 * `Buffer.from(x, 'hex')` NEVER throws — it decodes greedily and stops
 * at the first invalid pair, so it silently accepts trailing garbage:
 * `<goodDigest> + "ZZZZ"` decoded to exactly the good digest's bytes and
 * verified TRUE. Not forgeable (an attacker still needs the real
 * digest), but it makes a valid signature malleable, so the shape is
 * rejected up front rather than inferred from the decoded length.
 */
function isHexDigest(value: string): boolean {
  return value.length % 2 === 0 && /^[0-9a-f]+$/i.test(value);
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
 *
 * Returns `false` for every bad SIGNATURE, including a malformed header.
 * Throws for a bad CONFIG — see {@link assertVerifierConfig}.
 */
export function verifyWebhookSignature(
  options: VerifyWebhookSignatureOptions,
): boolean {
  const { payload, signature, secret, algorithm = 'sha256', prefix } = options;
  assertSecret(secret);

  const provided =
    prefix !== undefined && signature.startsWith(prefix)
      ? signature.slice(prefix.length)
      : signature;

  // Shape first — see `isHexDigest`. Decoding a malformed header and
  // inferring the fault from its length is what silently accepted a
  // valid digest with garbage appended.
  if (!isHexDigest(provided)) return false;

  const providedBuf = Buffer.from(provided, 'hex');
  const expectedBuf = Buffer.from(
    startHmac(algorithm, secret).update(payload).digest('hex'),
    'hex',
  );

  // `timingSafeEqual` throws on a length mismatch rather than returning
  // `false` — an attacker-controlled header must never reach it unguarded.
  if (providedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Binds a secret (and optional algorithm/prefix) ONCE, validating them
 * eagerly, and returns a per-request verifier.
 *
 * This is the shape to register as a provider: the config check runs
 * while Nest is building the module, so an unset `WEBHOOK_SECRET` or a
 * misspelled algorithm fails the boot with a message naming the
 * problem, instead of turning every inbound delivery into a silent 401
 * in production.
 *
 * ```ts
 * {
 *   provide: STRIPE_WEBHOOK_VERIFIER,
 *   useFactory: () =>
 *     createWebhookSignatureVerifier({ secret: process.env.WEBHOOK_SECRET }),
 * }
 * ```
 */
export function createWebhookSignatureVerifier(
  options: WebhookSignatureVerifierOptions,
): WebhookSignatureVerifier {
  const { secret, algorithm = 'sha256', prefix } = options;
  assertVerifierConfig(secret, algorithm);

  return (payload, signature) =>
    verifyWebhookSignature({ payload, signature, secret, algorithm, prefix });
}
