import { describe, expect, it } from 'vitest';
import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';

import {
  FreeFormJson,
  ROCKETS_TO_INSTANCE_OPTIONS,
  ROCKETS_TO_PLAIN_OPTIONS,
} from './crud-serialization';

class Dto {
  @Expose() id!: string;
  @Expose() @FreeFormJson() profile?: Record<string, unknown>;
  @Expose() plain?: Record<string, unknown>;
}

const BLOB = { a: 1, deep: { n: true }, list: ['x'] };

describe('rockets crud serialization', () => {
  it('round-trips a marked free-form property', () => {
    const instance = plainToInstance(
      Dto,
      { id: 'x', profile: BLOB, plain: BLOB, secret: 'no' },
      ROCKETS_TO_INSTANCE_OPTIONS,
    );
    const out = instanceToPlain(instance, ROCKETS_TO_PLAIN_OPTIONS) as Record<
      string,
      unknown
    >;

    expect(out.profile).toEqual(BLOB);
  });

  it('projects an UNMARKED object property to empty — the marker is the opt-out', () => {
    // The first revision asserted the opposite and called it a feature;
    // the mechanism it asserted is the nested-relation leak pinned
    // below. Unmarked objects recurse under excludeAll and yield {}.
    const instance = plainToInstance(
      Dto,
      { id: 'x', profile: BLOB, plain: BLOB },
      ROCKETS_TO_INSTANCE_OPTIONS,
    );
    const out = instanceToPlain(instance, ROCKETS_TO_PLAIN_OPTIONS) as Record<
      string,
      unknown
    >;

    expect(out.plain).toEqual({});
  });

  it('keeps the inbound whitelist intact', () => {
    const instance = plainToInstance(
      Dto,
      { id: 'x', secret: 'no' },
      ROCKETS_TO_INSTANCE_OPTIONS,
    );
    const out = instanceToPlain(instance, ROCKETS_TO_PLAIN_OPTIONS) as Record<
      string,
      unknown
    >;

    expect('secret' in out).toBe(false);
  });
});

describe('nested relation projection (the M1 leak pin)', () => {
  // The failure this pins: dropping `strategy: 'excludeAll'` makes an
  // `@Expose()`d relation WITHOUT `@Type()` — the common hand-written
  // class-DTO shape — emit the FULL child row (`owner.passwordHash`)
  // where the projection must yield `{}`. Shipped once; caught by
  // clean-room review; must never ship again.
  it('an @Expose()d relation without @Type() does not leak child columns', () => {
    class OwnerDto {}
    Expose()(OwnerDto.prototype, 'id');

    class PetDto {}
    Expose()(PetDto.prototype, 'id');
    Expose()(PetDto.prototype, 'owner');

    const row = {
      id: 'p1',
      owner: { id: 'u1', email: 'a@b.c', passwordHash: 'HASH-MUST-NOT-LEAK' },
    };

    const projected = instanceToPlain(
      plainToInstance(PetDto, row, ROCKETS_TO_INSTANCE_OPTIONS),
      ROCKETS_TO_PLAIN_OPTIONS,
    );

    expect(projected.id).toBe('p1');
    expect(projected.owner).toEqual({});
  });
});
