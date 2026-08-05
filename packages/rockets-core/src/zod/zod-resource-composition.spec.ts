import { describe, it, expect } from 'vitest';
import type { PlainLiteralObject, Type } from '@nestjs/common';
import { OwnerScopeHook, OwnerStampHook } from '../index';
import { applyOwnerHooks } from './zod-resource-composition';

describe('applyOwnerHooks', () => {
  class PetEntity {
    id!: string;
    userId!: string;
  }
  const entity = PetEntity as Type<PlainLiteralObject>;

  const isStamp = (hook: Type): boolean =>
    hook.prototype instanceof OwnerStampHook;
  const isScope = (hook: Type): boolean =>
    hook.prototype instanceof OwnerScopeHook;

  it('wires both the stamp (write) and scope (read) hook by default', () => {
    const hooks = applyOwnerHooks(
      entity,
      ['userId'],
      undefined,
      undefined,
      undefined,
      undefined,
    );

    expect(hooks).toHaveLength(2);
    expect(hooks?.some((h) => isStamp(h as Type))).toBe(true);
    expect(hooks?.some((h) => isScope(h as Type))).toBe(true);
  });

  it('omits the scope hook when ownerScope is false', () => {
    const hooks = applyOwnerHooks(
      entity,
      ['userId'],
      undefined,
      undefined,
      false,
      undefined,
    );

    expect(hooks).toHaveLength(1);
    expect(isStamp(hooks?.[0] as Type)).toBe(true);
  });

  it('omits the stamp hook when ownerStamp is false', () => {
    const hooks = applyOwnerHooks(
      entity,
      ['userId'],
      undefined,
      false,
      undefined,
      undefined,
    );

    expect(hooks).toHaveLength(1);
    expect(isScope(hooks?.[0] as Type)).toBe(true);
  });

  it('returns the user hooks untouched when there is no owner column', () => {
    class CustomHook {}
    const userHooks = [CustomHook as Type<PlainLiteralObject>];

    const hooks = applyOwnerHooks(
      entity,
      [],
      userHooks,
      undefined,
      undefined,
      undefined,
    );

    expect(hooks).toBe(userHooks);
  });

  it('preserves user hooks after the auto-wired owner hooks', () => {
    class CustomHook {}
    const userHooks = [CustomHook as Type<PlainLiteralObject>];

    const hooks = applyOwnerHooks(
      entity,
      ['userId'],
      userHooks,
      undefined,
      undefined,
      undefined,
    );

    expect(hooks).toHaveLength(3);
    expect(hooks?.[hooks.length - 1]).toBe(CustomHook);
  });
});
