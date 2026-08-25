export interface JobDispatchOptions {
  /**
   * A repeat `enqueue` with the SAME `dedupeKey` while a prior job under
   * that key is still pending/claimed returns the EXISTING job instead of
   * creating a second one — `deduped: true` on the result tells the
   * caller which happened. Once a job completes or fails without retry,
   * its `dedupeKey` frees up for reuse.
   */
  readonly dedupeKey?: string;
  /** Overrides the adapter's default lease duration for this job. */
  readonly leaseMs?: number;
}

export interface EnqueueResult {
  readonly jobId: string;
  readonly deduped: boolean;
}

export interface ClaimedJob<T = unknown> {
  readonly jobId: string;
  readonly name: string;
  readonly payload: T;
  /**
   * `1` on first delivery; incremented on every redelivery after an
   * expired lease — this is what makes the port at-least-once rather
   * than exactly-once, and what a handler checks to detect a retry.
   */
  readonly attempt: number;
}

export interface JobFailOptions {
  /**
   * `true` (default): the job becomes claimable again after its lease
   * would next expire, for another attempt. `false`: permanent failure,
   * no further delivery.
   */
  readonly retry?: boolean;
}

/**
 * Background job dispatch port (issue #53): named tasks with dedupe,
 * lease-based claiming, and at-least-once delivery, so apps stop
 * reinventing this over `@InjectDynamicRepository` for every product.
 *
 * Core ships one adapter, `InProcessJobDispatchService`, for tests and
 * samples. Production backends (Cloud Tasks, Bull, SQS, …) are an
 * app-provided implementation under {@link JOB_DISPATCH_SERVICE_TOKEN};
 * no queue vendor is a core dependency, the same rule as the storage SDK
 * for the file storage seam. See `CONFIGURATION.md` §6d.
 *
 * A handler that touches repositories MUST forward `ctx` /
 * `TransactionScope` the same as any other entry point (#45) — this port
 * says nothing about transactions on its own; `claim` handing back a job
 * is not itself inside one.
 */
export interface JobDispatchServiceInterface {
  enqueue(
    name: string,
    payload: unknown,
    opts?: JobDispatchOptions,
  ): Promise<EnqueueResult>;
  /**
   * Claims the next available job whose `name` is in `names` (any name
   * when omitted), or `undefined` if none is available right now.
   */
  claim(names?: readonly string[]): Promise<ClaimedJob | undefined>;
  /**
   * Extends a claimed job's lease — call periodically during long work
   * so another worker does not treat it as abandoned and redeliver it.
   */
  heartbeat(jobId: string, leaseMs?: number): Promise<void>;
  complete(jobId: string): Promise<void>;
  fail(jobId: string, opts?: JobFailOptions): Promise<void>;
}

/** DI token for a {@link JobDispatchServiceInterface} implementation. */
export const JOB_DISPATCH_SERVICE_TOKEN = Symbol.for(
  '@concepta/rockets-core/job-dispatch-service',
);
