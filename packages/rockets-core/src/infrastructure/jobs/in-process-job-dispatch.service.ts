import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import type {
  ClaimedJob,
  EnqueueResult,
  JobDispatchOptions,
  JobDispatchServiceInterface,
  JobFailOptions,
} from '../../domain/interfaces/job-dispatch.interface';

type JobStatus = 'pending' | 'claimed' | 'completed' | 'failed';

interface JobRecord {
  readonly jobId: string;
  readonly name: string;
  readonly payload: unknown;
  readonly dedupeKey: string | undefined;
  readonly leaseMs: number;
  status: JobStatus;
  attempt: number;
  /** Epoch ms. Only meaningful while `status === 'claimed'`. */
  leaseUntil: number | undefined;
}

const DEFAULT_LEASE_MS = 30_000;

/**
 * In-process reference adapter for {@link JobDispatchServiceInterface}
 * (issue #53) — in-memory, single-process. Correct for tests and samples;
 * a real deployment needs a persisted / cross-process backend (Cloud
 * Tasks, Bull, SQS, …) implementing the same interface. Jobs are never
 * garbage-collected here — a long-running process enqueuing continuously
 * without a store swap will grow this map unbounded, which is expected
 * for what this adapter is FOR (tests, single-process samples), not a
 * production limitation to fix in place.
 */
@Injectable()
export class InProcessJobDispatchService
  implements JobDispatchServiceInterface
{
  private readonly jobs = new Map<string, JobRecord>();
  private readonly dedupeIndex = new Map<string, string>();

  async enqueue(
    name: string,
    payload: unknown,
    opts?: JobDispatchOptions,
  ): Promise<EnqueueResult> {
    const dedupeKey = opts?.dedupeKey;
    if (dedupeKey !== undefined) {
      const existing = this.activeJobForDedupeKey(dedupeKey);
      if (existing !== undefined) {
        return { jobId: existing.jobId, deduped: true };
      }
    }

    const jobId = randomUUID();
    this.jobs.set(jobId, {
      jobId,
      name,
      payload,
      dedupeKey,
      leaseMs: opts?.leaseMs ?? DEFAULT_LEASE_MS,
      status: 'pending',
      attempt: 0,
      leaseUntil: undefined,
    });
    if (dedupeKey !== undefined) this.dedupeIndex.set(dedupeKey, jobId);
    return { jobId, deduped: false };
  }

  async claim(names?: readonly string[]): Promise<ClaimedJob | undefined> {
    const now = Date.now();
    for (const job of this.jobs.values()) {
      if (names !== undefined && !names.includes(job.name)) continue;
      const leaseExpired =
        job.status === 'claimed' &&
        job.leaseUntil !== undefined &&
        job.leaseUntil <= now;
      if (job.status !== 'pending' && !leaseExpired) continue;

      job.status = 'claimed';
      job.attempt += 1;
      job.leaseUntil = now + job.leaseMs;
      return {
        jobId: job.jobId,
        name: job.name,
        payload: job.payload,
        attempt: job.attempt,
      };
    }
    return undefined;
  }

  async heartbeat(jobId: string, leaseMs?: number): Promise<void> {
    const job = this.requireClaimed(jobId, 'heartbeat');
    job.leaseUntil = Date.now() + (leaseMs ?? job.leaseMs);
  }

  async complete(jobId: string): Promise<void> {
    const job = this.requireJob(jobId, 'complete');
    job.status = 'completed';
    job.leaseUntil = undefined;
    this.releaseDedupeKey(job);
  }

  async fail(jobId: string, opts?: JobFailOptions): Promise<void> {
    const job = this.requireJob(jobId, 'fail');
    const retry = opts?.retry ?? true;
    job.leaseUntil = undefined;
    if (retry) {
      // Claimable again immediately — a retry does not wait out a lease
      // it no longer holds.
      job.status = 'pending';
      return;
    }
    job.status = 'failed';
    this.releaseDedupeKey(job);
  }

  private activeJobForDedupeKey(dedupeKey: string): JobRecord | undefined {
    const jobId = this.dedupeIndex.get(dedupeKey);
    if (jobId === undefined) return undefined;
    const job = this.jobs.get(jobId);
    // `completed` / `failed(no-retry)` already released the index entry
    // in `complete`/`fail`, so anything still indexed here is active by
    // construction — this check exists for defensive symmetry only.
    return job?.status === 'completed' || job?.status === 'failed'
      ? undefined
      : job;
  }

  private releaseDedupeKey(job: JobRecord): void {
    if (job.dedupeKey !== undefined) this.dedupeIndex.delete(job.dedupeKey);
  }

  private requireJob(jobId: string, op: string): JobRecord {
    const job = this.jobs.get(jobId);
    if (job === undefined) {
      throw new Error(
        `InProcessJobDispatchService.${op}: unknown jobId "${jobId}"`,
      );
    }
    return job;
  }

  private requireClaimed(jobId: string, op: string): JobRecord {
    const job = this.requireJob(jobId, op);
    if (job.status !== 'claimed') {
      throw new Error(
        `InProcessJobDispatchService.${op}: job "${jobId}" is not currently claimed (status: ${job.status})`,
      );
    }
    return job;
  }
}
