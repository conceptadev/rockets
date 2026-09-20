/**
 * `MERGE_BACK_KEYS` in `entity-hook.ts` is a hand-kept list derived from
 * which upstream membrane each channel is wired through. Hand-kept lists
 * rot — `entity-hook-channel-parity.spec.ts` exists because one already
 * did. This file removes the guesswork: it drives upstream's OWN
 * `RepoPermeatorFactory` and observes, per channel, whether a hook that
 * returns a NEW object has that return honoured or silently merged away.
 *
 * A channel where the return is merged away NEEDS merge-back. A channel
 * where the return is honoured must NOT be wrapped (wrapping would
 * re-introduce a merge upstream does not do). If upstream changes a
 * membrane in a future alpha, this fails instead of quietly un-fixing a
 * channel.
 */
import { describe, it, expect } from 'vitest';
import { RepoPermeatorFactory } from '@concepta/nestjs-repository';
import type { HookMethodMetadataInterface } from '@concepta/nestjs-core';
import type { PlainLiteralObject } from '@nestjs/common';

import { MERGE_BACK_KEYS_FOR_TEST } from './entity-hook';

/** Upstream hook-method key -> the Rockets lifecycle name. */
const CHANNELS: ReadonlyArray<{
  /** Rockets lifecycle key. */
  readonly lifecycle: string;
  /** Upstream `RepoHookMethodKey` value. */
  readonly key: string;
  /** Which permeator on the factory carries it. */
  readonly permeator: string;
  /** Which half of the permeator: before-hooks or after-hooks. */
  readonly phase: 'before' | 'after';
}> = [
  { lifecycle: 'beforeCreate', key: 'beforeCreate', permeator: 'create', phase: 'before' }, // prettier-ignore
  { lifecycle: 'afterCreate', key: 'afterCreate', permeator: 'create', phase: 'after' }, // prettier-ignore
  { lifecycle: 'beforeUpdate', key: 'beforeUpdate', permeator: 'update', phase: 'before' }, // prettier-ignore
  { lifecycle: 'afterUpdate', key: 'afterUpdate', permeator: 'update', phase: 'after' }, // prettier-ignore
  { lifecycle: 'beforeReplace', key: 'beforeReplace', permeator: 'replace', phase: 'before' }, // prettier-ignore
  { lifecycle: 'afterReplace', key: 'afterReplace', permeator: 'replace', phase: 'after' }, // prettier-ignore
  { lifecycle: 'beforeUpsert', key: 'beforeUpsert', permeator: 'upsert', phase: 'before' }, // prettier-ignore
  { lifecycle: 'afterUpsert', key: 'afterUpsert', permeator: 'upsert', phase: 'after' }, // prettier-ignore
  { lifecycle: 'beforeDelete', key: 'beforeDelete', permeator: 'delete', phase: 'before' }, // prettier-ignore
  { lifecycle: 'afterDelete', key: 'afterDelete', permeator: 'delete', phase: 'after' }, // prettier-ignore
  { lifecycle: 'beforeSoftDelete', key: 'beforeSoftDelete', permeator: 'softDelete', phase: 'before' }, // prettier-ignore
  { lifecycle: 'afterSoftDelete', key: 'afterSoftDelete', permeator: 'softDelete', phase: 'after' }, // prettier-ignore
  { lifecycle: 'beforeRestore', key: 'beforeRestore', permeator: 'restore', phase: 'before' }, // prettier-ignore
  { lifecycle: 'afterRestore', key: 'afterRestore', permeator: 'restore', phase: 'after' }, // prettier-ignore
  { lifecycle: 'beforeFindOne', key: 'beforeFindOne', permeator: 'findOne', phase: 'before' }, // prettier-ignore
  { lifecycle: 'afterFindOne', key: 'afterFindOne', permeator: 'findOne', phase: 'after' }, // prettier-ignore
  { lifecycle: 'beforeFind', key: 'beforeFind', permeator: 'find', phase: 'before' }, // prettier-ignore
  { lifecycle: 'beforeCount', key: 'beforeCount', permeator: 'count', phase: 'before' }, // prettier-ignore
  { lifecycle: 'beforeFindAndCount', key: 'beforeFindAndCount', permeator: 'findAndCount', phase: 'before' }, // prettier-ignore
  { lifecycle: 'afterFindAndCount', key: 'afterFindAndCount', permeator: 'findAndCount', phase: 'after' }, // prettier-ignore
];

interface Permeate {
  permeate(
    base: unknown,
    callback: (value: unknown, ambient: unknown) => unknown,
    ambient: unknown,
  ): Promise<unknown>;
}

/**
 * Runs one channel through upstream with a hook that returns a NEW
 * object carrying a correction on a field the base already has.
 *
 * @returns whether the correction survived without Rockets' merge-back.
 */
async function correctionSurvivesUpstream(channel: {
  key: string;
  permeator: string;
  phase: 'before' | 'after';
}): Promise<boolean> {
  const base: PlainLiteralObject = { id: 'base', field: 'raw' };

  // The write `before*` channels are wired through TWO passes — a merge
  // pass filtered to `RepoHookStrategy.merge` and a replace pass
  // filtered to `RepoHookStrategy.replace`. A hook authored the ordinary
  // way carries no `replace` option, so it matches only the merge pass.
  // Honouring `filter` is what makes this probe model a real hook rather
  // than one that answers both passes.
  const metadataOfAnOrdinaryHook = {
    key: channel.key,
    options: undefined,
  } as unknown as HookMethodMetadataInterface;

  // Stand-in for `RepositoryAdapter.runHooks`: answers only the channel
  // under test, and answers it the way a hook written as "return a new
  // object" does.
  const runHooks = async <T>(
    methodKey: string,
    payload: T,
    _ctx: unknown,
    filter?: (metadata: HookMethodMetadataInterface) => boolean,
  ): Promise<T> => {
    if (methodKey !== channel.key) return payload;
    if (filter && !filter(metadataOfAnOrdinaryHook)) return payload;
    // Mirrors upstream's own `RunHooksFn<T>` contract, which promises to
    // return the payload type it was handed. A hook reshapes the object
    // it receives, so this fixture does the same; the assertion under
    // test reads the field, not the type.
    return { ...(payload as PlainLiteralObject), field: 'corrected' } as T;
  };

  const factory = new RepoPermeatorFactory(
    runHooks,
    'probe',
  ) as unknown as Record<string, Permeate>;
  const permeator = factory[channel.permeator];

  // `find` and `createMany` shape their output as a collection, so the
  // stand-in database call has to hand one back or the membrane throws
  // before the channel under test is reached.
  const collectionOutput = channel.permeator === 'find';

  let seenByCallback: unknown;
  const result = await permeator.permeate(
    base,
    (value: unknown) => {
      seenByCallback = value;
      if (collectionOutput) return [];
      // The "database call". For an after-channel the row it returns is
      // what the after-hooks then shape.
      return channel.phase === 'after' ? { id: 'base', field: 'raw' } : value;
    },
    {},
  );

  const observed = (channel.phase === 'before' ? seenByCallback : result) as
    | PlainLiteralObject
    | undefined;

  return observed?.field === 'corrected';
}

describe('MERGE_BACK_KEYS tracks upstream membrane behaviour', () => {
  it('covers every channel the Rockets lifecycle exposes on a shared permeator', () => {
    // Guards the table below: a typo'd permeator name would make every
    // assertion vacuous by throwing, but a SHRUNK table would not.
    expect(CHANNELS.length).toBeGreaterThanOrEqual(20);
  });

  for (const channel of CHANNELS) {
    const shouldMergeBack = MERGE_BACK_KEYS_FOR_TEST.has(channel.lifecycle);

    it(`${channel.lifecycle}: ${
      shouldMergeBack ? 'needs' : 'does not need'
    } merge-back`, async () => {
      const survives = await correctionSurvivesUpstream(channel);

      // A channel whose return is honoured upstream must NOT be in the
      // list; one whose return is merged away MUST be.
      expect(
        survives,
        shouldMergeBack
          ? `${channel.lifecycle} is in MERGE_BACK_KEYS, but upstream now honours ` +
              'the returned object on its own — remove it from the list, the ' +
              'wrapper is re-introducing a merge upstream does not do.'
          : `${channel.lifecycle} is NOT in MERGE_BACK_KEYS, but upstream discards ` +
              'the object a hook returns — add it, or a hook written the ' +
              'documented way silently does nothing.',
      ).toBe(!shouldMergeBack);
    });
  }
});
