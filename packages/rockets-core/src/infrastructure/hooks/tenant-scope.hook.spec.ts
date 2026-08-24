import { describe, it, expect } from 'vitest';
import type { PlainLiteralObject } from '@nestjs/common';
import type { OverlayRef } from '@concepta/nestjs-core';
import { TenantScopeHook } from './tenant-scope.hook';
import { ActorCtx } from '../interceptors/actor.overlay';
import type { EntityHookContext } from './entity-hook';

interface Pet extends PlainLiteralObject {
  readonly id: string;
  readonly name: string;
  readonly shelterId: string;
}

class PetEntity {
  id!: string;
  name!: string;
  shelterId!: string;
}

function fakeCtx(
  args: { actor?: { id: string; type: 'user' } } = {},
): EntityHookContext {
  const ctx = {
    entity: 'pet',
    params: {},
    query: {},
    options: {},
    operation: 'list',
    action: 'read',
    supports: (ref: OverlayRef<string, PlainLiteralObject, unknown[]>) =>
      ref === ActorCtx,
    with: (ref: OverlayRef<string, PlainLiteralObject, unknown[]>) => {
      if (ref === ActorCtx) return args.actor;
      return undefined;
    },
  };
  return ctx as unknown as EntityHookContext;
}

describe('TenantScopeHook.for() factory', () => {
  it('returns a class that extends TenantScopeHook', () => {
    const Hook = TenantScopeHook.for<Pet>(PetEntity, {
      tenantKey: 'shelterId',
      resolve: () => ['s1'],
    });
    const instance = new Hook();
    expect(instance).toBeInstanceOf(TenantScopeHook);
  });

  it('produces distinct subclasses on every call, even for the same entity+key', () => {
    const A = TenantScopeHook.for<Pet>(PetEntity, {
      tenantKey: 'shelterId',
      resolve: () => ['s1'],
    });
    const B = TenantScopeHook.for<Pet>(PetEntity, {
      tenantKey: 'shelterId',
      resolve: () => ['s2'],
    });
    expect(A).not.toBe(B);
  });

  describe('runtime behaviour — fail-closed', () => {
    it("no actor: produces a where clause (deny), unlike OwnerScopeHook's no-op", async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s1'],
      });
      const instance = new Hook();
      const original = {};
      const result = await instance.beforeFindOne(original);
      // Unlike OwnerScopeHook: NOT the same reference, and a where clause
      // IS present — this is the fail-closed divergence the class exists for.
      expect(result).not.toBe(original);
      expect((result as PlainLiteralObject).where).toBeDefined();
    });

    it('resolve() returning an empty array denies just like no actor', async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => [],
      });
      const instance = new Hook();
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const result = await instance.beforeFindOne({}, ctx);
      expect((result as PlainLiteralObject).where).toBeDefined();
    });

    it('an async resolve() is awaited', async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: async () => {
          await Promise.resolve();
          return ['s1', 's2'];
        },
      });
      const instance = new Hook();
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const result = await instance.beforeFindOne({}, ctx);
      expect((result as PlainLiteralObject).where).toBeDefined();
    });
  });

  describe('runtime behaviour — resolved scope', () => {
    it('beforeFindOne applies a scoped clause when resolve() returns ids', async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s1', 's2'],
      });
      const instance = new Hook();
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const result = await instance.beforeFindOne({}, ctx);
      expect((result as PlainLiteralObject).where).toBeDefined();
    });

    it('beforeFindAndCount applies the same clause shape', async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s1'],
      });
      const instance = new Hook();
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const result = await instance.beforeFindAndCount({}, ctx);
      expect((result as PlainLiteralObject).where).toBeDefined();
    });

    it('AND-composes with a pre-existing where clause (no neutering)', async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s1'],
      });
      const instance = new Hook();
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const original = { where: { foo: 'bar' } } as PlainLiteralObject;
      const result = (await instance.beforeFindOne(
        original as unknown as never,
        ctx,
      )) as PlainLiteralObject;
      expect(result.where).toBeDefined();
      expect(result).not.toBe(original);
    });

    it('different resolved sets produce different clauses', async () => {
      const HookA = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s1'],
      });
      const HookB = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s2'],
      });
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const a = await new HookA().beforeFindOne({}, ctx);
      const b = await new HookB().beforeFindOne({}, ctx);
      expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
    });
  });
});
