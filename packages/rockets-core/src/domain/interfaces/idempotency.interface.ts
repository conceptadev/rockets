/**
 * A previously-produced response, cached under an idempotency key so a
 * repeat request replays it verbatim instead of re-running the handler.
 */
export interface StoredIdempotentResponse {
  /**
   * The status the ORIGINAL request answered with — part of "verbatim",
   * so a replay MUST apply it rather than fall back to whatever status
   * the current operation declares. An operation that answers `201` on
   * create and `202` when it queues the work would otherwise replay a
   * queued job as if it had completed.
   *
   * Nest sets the declared `status` BEFORE the handler runs and does not
   * re-apply it afterwards, so a handler replays it through the response
   * escape hatch:
   *
   * ```ts
   * (ctx.response.raw as { status(code: number): unknown }).status(
   *   existing.status,
   * );
   * return existing.body;
   * ```
   *
   * See `CONFIGURATION.md` §6e.
   */
  readonly status: number;
  readonly body: unknown;
  /**
   * Hash of the ORIGINAL request body — a repeat request with the SAME
   * key but a DIFFERENT hash is a conflict, not a replay. See
   * `hashIdempotentRequest`.
   */
  readonly requestHash: string;
}

/**
 * Idempotency-key storage port (issue #59). A write operation checks this
 * BEFORE running its handler: an unseen key runs normally and stores the
 * result; a seen key with a matching request hash replays the stored
 * result without re-running anything; a seen key with a different hash is
 * a client error (reused key, different body).
 *
 * ## The key MUST be namespaced by the authenticated principal
 *
 * `Idempotency-Key` is a CLIENT-CHOSEN string. Two tenants routinely
 * pick the same one (`order-1`, a local row id, a retry counter), so a
 * store keyed on the raw header value is a cross-tenant data leak the
 * moment the operation requires auth: user B sending
 * `Idempotency-Key: order-abc` gets back user A's stored response body.
 * Namespace it with the principal the guard resolved — never with
 * anything else the client controls:
 *
 * ```ts
 * const scopedKey = `${ctx.user.id}:${idempotencyKey}`;
 * ```
 *
 * A tenant-scoped app scopes by tenant as well (`${tenantId}:${userId}:…`).
 * Only a genuinely public, unauthenticated operation (an inbound webhook
 * keyed off the provider's delivery id) may use the raw value, and then
 * the provider — not a client — is the one choosing it.
 *
 * Pick a separator the id cannot contain, or length-prefix the parts.
 * With a plain `:` and an id that may contain one (an external IdP
 * `sub`, a tenant slug), `("a:b", "c")` and `("a", "b:c")` collapse to
 * one key — the leak this scoping exists to prevent, reintroduced by
 * the delimiter.
 *
 * ## This is at-least-once, NOT exactly-once
 *
 * `get` then `set` is not atomic and this port has no reserve
 * operation, so two requests that both miss before either stores BOTH
 * run the handler — measured at 7 executions for 20 concurrent
 * same-key requests, and asserted deterministically in
 * `rockets-core-idempotency-webhook.e2e-spec.ts`. The pattern
 * de-duplicates SEQUENTIAL retries (the overwhelmingly common case: a
 * client re-sending after a timeout); it does not serialise a
 * concurrent burst. Where double execution is unacceptable, the
 * handler's own work must be idempotent, or the store must add an
 * atomic reserve (`setIfAbsent`-style) that a real backend can
 * implement — an open design question on this interface, not something
 * an implementer can fix behind the current contract.
 *
 * Core ships one adapter, `InMemoryIdempotencyStore`, for tests and
 * samples. A production app provides a persisted implementation (a
 * dynamic-repository table, Redis, …) under
 * {@link IDEMPOTENCY_STORE_TOKEN} — no store technology is a core
 * dependency. See `CONFIGURATION.md` §6e.
 */
export interface IdempotencyStoreInterface {
  /** @param key - the PRINCIPAL-SCOPED key — see the interface docs. */
  get(key: string): Promise<StoredIdempotentResponse | undefined>;
  /**
   * `ttlMs` bounds how long a key is remembered — after it elapses the
   * key is available for reuse with a fresh request.
   *
   * @param key - the PRINCIPAL-SCOPED key — see the interface docs.
   */
  set(
    key: string,
    response: StoredIdempotentResponse,
    ttlMs: number,
  ): Promise<void>;
}

/** DI token for an {@link IdempotencyStoreInterface} implementation. */
export const IDEMPOTENCY_STORE_TOKEN = Symbol.for(
  '@concepta/rockets-core/idempotency-store',
);
