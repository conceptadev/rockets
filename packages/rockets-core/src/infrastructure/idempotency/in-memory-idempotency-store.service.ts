import { Injectable } from '@nestjs/common';

import type {
  IdempotencyStoreInterface,
  StoredIdempotentResponse,
} from '../../domain/interfaces/idempotency.interface';

interface Entry {
  readonly response: StoredIdempotentResponse;
  readonly expiresAt: number;
}

/**
 * In-process reference adapter for {@link IdempotencyStoreInterface}
 * (issue #59) — in-memory, single-process, and per-instance: correct for
 * tests and samples, not for a multi-instance deployment (two instances
 * would each accept the "first" request under a given key). A production
 * app needs a shared backend — a dynamic-repository table or Redis —
 * behind the same interface.
 */
@Injectable()
export class InMemoryIdempotencyStore implements IdempotencyStoreInterface {
  private readonly entries = new Map<string, Entry>();

  async get(key: string): Promise<StoredIdempotentResponse | undefined> {
    const entry = this.entries.get(key);
    if (entry === undefined) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.response;
  }

  async set(
    key: string,
    response: StoredIdempotentResponse,
    ttlMs: number,
  ): Promise<void> {
    this.entries.set(key, { response, expiresAt: Date.now() + ttlMs });
  }
}
