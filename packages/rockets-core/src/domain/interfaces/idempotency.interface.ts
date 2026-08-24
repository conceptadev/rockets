/**
 * A previously-produced response, cached under an idempotency key so a
 * repeat request replays it verbatim instead of re-running the handler.
 */
export interface StoredIdempotentResponse {
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
 * Core ships one adapter, `InMemoryIdempotencyStore`, for tests and
 * samples. A production app provides a persisted implementation (a
 * dynamic-repository table, Redis, …) under
 * {@link IDEMPOTENCY_STORE_TOKEN} — no store technology is a core
 * dependency. See `CONFIGURATION.md` §6e.
 */
export interface IdempotencyStoreInterface {
  get(key: string): Promise<StoredIdempotentResponse | undefined>;
  /**
   * `ttlMs` bounds how long a key is remembered — after it elapses the
   * key is available for reuse with a fresh request.
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
