/**
 * Upstream owns the channel inventory; Rockets can only mirror it. Every
 * channel it exposes and this package does not is a hook that silently
 * never runs — which is not a theoretical failure mode: `replace`, `find`,
 * `count`, `upsert` and `createMany` were each missing at some point, and
 * the first of them let a client hand their row to another owner.
 *
 * Nothing warns when upstream adds a channel, so this test is the warning:
 * it enumerates the decorators upstream actually exports and fails when one
 * has no counterpart here. Deliberate omissions go in EXCLUDED with the
 * reason, and an EXCLUDED entry that upstream no longer exports fails too,
 * so the list cannot rot into a permanent excuse.
 */
import { describe, it, expect } from 'vitest';
import * as upstream from '@concepta/nestjs-repository';

import { PassthroughEntityHookBase } from './entity-hook';

/** `BeforeFindOne` -> `beforeFindOne`. */
const toChannel = (decorator: string): string =>
  decorator.charAt(0).toLowerCase() + decorator.slice(1);

const EXCLUDED: Readonly<Record<string, string>> = {
  // Category channels: they fire for every operation of a kind, so a hook
  // bound to one cannot know which operation it is shaping. Rockets models
  // operations, not categories — a consumer wanting the broad seam uses
  // the upstream decorator directly.
  beforeRead: 'category channel, not an operation',
  afterRead: 'category channel, not an operation',
  beforeWrite: 'category channel, not an operation',
  afterWrite: 'category channel, not an operation',
  beforeTransition: 'category channel, not an operation',
  afterTransition: 'category channel, not an operation',
  beforeDestroy: 'category channel, not an operation',
  afterDestroy: 'category channel, not an operation',
  // `deleteMany` receives rows that were already fetched. Scoping belongs
  // to the fetch that produced them, and a stamp has nothing to stamp.
  beforeDeleteMany: 'payload is rows already fetched; scope the fetch',
  afterDeleteMany: 'payload is rows already fetched; scope the fetch',
};

const upstreamChannels: readonly string[] = Object.keys(upstream)
  .filter((key) => /^(Before|After)[A-Z]/.test(key))
  .map(toChannel)
  .sort();

const coveredChannels: readonly string[] = Object.getOwnPropertyNames(
  PassthroughEntityHookBase.prototype,
)
  .filter((name) => /^(before|after)[A-Z]/.test(name))
  .sort();

describe('entity hook channels track upstream', () => {
  it('finds upstream channels to compare against', () => {
    // Guards the whole file: an upstream rename that empties this list
    // would make every assertion below vacuously true.
    expect(upstreamChannels.length).toBeGreaterThan(20);
    expect(coveredChannels.length).toBeGreaterThan(20);
  });

  it('covers every upstream channel that is not deliberately excluded', () => {
    const missing = upstreamChannels.filter(
      (channel) => !coveredChannels.includes(channel) && !(channel in EXCLUDED),
    );
    expect(
      missing,
      `upstream exposes ${missing.join(', ')} with no Rockets channel — ` +
        'add it to the lifecycle and the hook bases, or list it in ' +
        'EXCLUDED with the reason',
    ).toEqual([]);
  });

  it('exposes no channel upstream does not have', () => {
    const phantom = coveredChannels.filter(
      (channel) => !upstreamChannels.includes(channel),
    );
    expect(
      phantom,
      `${phantom.join(', ')} is declared here but not exported upstream, ` +
        'so nothing will ever invoke it',
    ).toEqual([]);
  });

  it('keeps the exclusion list honest', () => {
    const stale = Object.keys(EXCLUDED).filter(
      (channel) => !upstreamChannels.includes(channel),
    );
    expect(
      stale,
      `${stale.join(', ')} is excluded but upstream no longer exports it`,
    ).toEqual([]);

    const contradictory = Object.keys(EXCLUDED).filter((channel) =>
      coveredChannels.includes(channel),
    );
    expect(
      contradictory,
      `${contradictory.join(', ')} is both excluded and implemented`,
    ).toEqual([]);
  });
});
