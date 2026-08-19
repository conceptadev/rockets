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

  it('preserves an unmarked one too — the whitelist does not need excludeAll', () => {
    const instance = plainToInstance(
      Dto,
      { id: 'x', profile: BLOB, plain: BLOB },
      ROCKETS_TO_INSTANCE_OPTIONS,
    );
    const out = instanceToPlain(instance, ROCKETS_TO_PLAIN_OPTIONS) as Record<
      string,
      unknown
    >;

    expect(out.plain).toEqual(BLOB);
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
