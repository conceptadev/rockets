import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InProcessJobDispatchService } from './in-process-job-dispatch.service';

describe('InProcessJobDispatchService', () => {
  let service: InProcessJobDispatchService;

  beforeEach(() => {
    service = new InProcessJobDispatchService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dedupes a repeat enqueue under the same dedupeKey while the job is still active', async () => {
    const first = await service.enqueue(
      'send-email',
      { to: 'a@b.com' },
      {
        dedupeKey: 'welcome:u1',
      },
    );
    const second = await service.enqueue(
      'send-email',
      { to: 'a@b.com' },
      {
        dedupeKey: 'welcome:u1',
      },
    );

    expect(first.deduped).toBe(false);
    expect(second.deduped).toBe(true);
    expect(second.jobId).toBe(first.jobId);
  });

  it('frees the dedupeKey once the job completes', async () => {
    const { jobId } = await service.enqueue(
      'send-email',
      {},
      {
        dedupeKey: 'welcome:u1',
      },
    );
    await service.claim();
    await service.complete(jobId);

    const again = await service.enqueue(
      'send-email',
      {},
      {
        dedupeKey: 'welcome:u1',
      },
    );

    expect(again.deduped).toBe(false);
    expect(again.jobId).not.toBe(jobId);
  });

  it('claim returns undefined when nothing is pending', async () => {
    await expect(service.claim()).resolves.toBeUndefined();
  });

  it('claim filters by name and increments attempt on first delivery', async () => {
    await service.enqueue('other', {});
    const { jobId } = await service.enqueue('send-email', { x: 1 });

    const claimed = await service.claim(['send-email']);

    expect(claimed).toMatchObject({ jobId, name: 'send-email', attempt: 1 });
  });

  it('at-least-once: an expired lease makes the job claimable again with attempt incremented', async () => {
    vi.useFakeTimers();
    await service.enqueue('render', {}, { leaseMs: 100 });

    const firstClaim = await service.claim();
    expect(firstClaim?.attempt).toBe(1);

    // Crashed worker: no heartbeat, no complete. Advance past the lease.
    vi.advanceTimersByTime(150);

    const redelivered = await service.claim();
    expect(redelivered?.jobId).toBe(firstClaim?.jobId);
    expect(redelivered?.attempt).toBe(2);
  });

  it('a live lease is not claimable by a second caller', async () => {
    vi.useFakeTimers();
    await service.enqueue('render', {}, { leaseMs: 10_000 });
    await service.claim();

    await expect(service.claim()).resolves.toBeUndefined();
  });

  it('heartbeat extends the lease past when it would otherwise expire', async () => {
    vi.useFakeTimers();
    const { jobId } = await service.enqueue('render', {}, { leaseMs: 100 });
    await service.claim();

    vi.advanceTimersByTime(80);
    await service.heartbeat(jobId);
    vi.advanceTimersByTime(80);

    // 160ms elapsed total, but the heartbeat reset the 100ms window at
    // t=80 — still within lease, so no redelivery.
    await expect(service.claim()).resolves.toBeUndefined();
  });

  it('fail with retry (the default) makes the job immediately reclaimable', async () => {
    const { jobId } = await service.enqueue('render', {});
    const claimed = await service.claim();
    await service.fail(jobId);

    const redelivered = await service.claim();
    expect(redelivered?.jobId).toBe(claimed?.jobId);
    expect(redelivered?.attempt).toBe(2);
  });

  it('fail without retry stops delivery permanently and frees the dedupeKey', async () => {
    const { jobId } = await service.enqueue(
      'render',
      {},
      {
        dedupeKey: 'render:doc-1',
      },
    );
    await service.claim();
    await service.fail(jobId, { retry: false });

    await expect(service.claim()).resolves.toBeUndefined();

    const again = await service.enqueue(
      'render',
      {},
      {
        dedupeKey: 'render:doc-1',
      },
    );
    expect(again.deduped).toBe(false);
  });

  it('heartbeat on an unclaimed job throws', async () => {
    const { jobId } = await service.enqueue('render', {});
    await expect(service.heartbeat(jobId)).rejects.toThrow(
      /not currently claimed/,
    );
  });

  it('operating on an unknown jobId throws', async () => {
    await expect(service.complete('does-not-exist')).rejects.toThrow(
      /unknown jobId/,
    );
  });
});
