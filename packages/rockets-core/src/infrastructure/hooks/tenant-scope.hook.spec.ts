import { describe, it, expect } from 'vitest';
import type { PlainLiteralObject } from '@nestjs/common';
import type { OverlayRef } from '@concepta/nestjs-core';
import { Where } from '@concepta/nestjs-repository';
import { TenantScopeHook } from './tenant-scope.hook';
import { getEntityHookBinding } from './entity-hook';
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

/**
 * The exact clause the hook must emit when the actor resolves to no
 * tenant: a `NULL AND NOT NULL` contradiction on the tenant column.
 *
 * Asserted by VALUE, not by `toBeDefined()`. The distinction matters: the
 * fail-OPEN alternative the hook's own doc argues against —
 * `Where.in(tenantKey, [])` — is also "defined", so a presence check
 * cannot tell the safe clause from the unsafe one. Every assertion below
 * that involves the deny path compares full structure for that reason.
 */
const denyAll = Where.and(
  Where.isNull<Pet>('shelterId'),
  Where.notNull<Pet>('shelterId'),
);

/** The shape that must NEVER be produced — see {@link denyAll}. */
const failOpenEmptyIn = Where.in<Pet>('shelterId', []);

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

  describe('entity binding', () => {
    it('binds to the derived entity key by default', () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s1'],
      });
      expect(getEntityHookBinding(Hook)).toEqual({
        entity: PetEntity,
        entityKey: 'pet',
      });
    });

    it('binds to an explicit entityKey when the resource uses a custom key', () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s1'],
        entityKey: 'pets',
      });
      expect(getEntityHookBinding(Hook)).toEqual({
        entity: PetEntity,
        entityKey: 'pets',
      });
    });
  });

  describe('runtime behaviour — fail-closed', () => {
    it('no actor: emits the NULL-AND-NOT-NULL contradiction, not an empty IN', async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s1'],
      });
      const instance = new Hook();
      const original = {};
      const result = await instance.beforeFindOne(original);

      expect(result).not.toBe(original);
      expect(result.where).toEqual(denyAll);
      expect(result.where).not.toEqual(failOpenEmptyIn);
    });

    it('resolve() returning an empty array denies with the same clause as no actor', async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => [],
      });
      const instance = new Hook();
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const result = await instance.beforeFindOne({}, ctx);

      expect(result.where).toEqual(denyAll);
      expect(result.where).not.toEqual(failOpenEmptyIn);
    });

    it('the deny clause AND-composes with an existing where instead of replacing it', async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => [],
      });
      const instance = new Hook();
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const existing = Where.eq<Pet>('name', 'Rex');
      const result = await instance.beforeFindOne({ where: existing }, ctx);

      expect(result.where).toEqual(Where.and(existing, denyAll));
    });

    it('an async resolve() is awaited (not left as a pending Promise in the clause)', async () => {
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

      expect(result.where).toEqual(Where.in<Pet>('shelterId', ['s1', 's2']));
    });
  });

  describe('runtime behaviour — resolved scope', () => {
    it('beforeFindOne emits IN over exactly the resolved ids', async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s1', 's2'],
      });
      const instance = new Hook();
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const result = await instance.beforeFindOne({}, ctx);

      expect(result.where).toEqual(Where.in<Pet>('shelterId', ['s1', 's2']));
    });

    it('beforeFindAndCount emits the same clause as beforeFindOne', async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s1'],
      });
      const instance = new Hook();
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const result = await instance.beforeFindAndCount({}, ctx);

      expect(result.where).toEqual(Where.in<Pet>('shelterId', ['s1']));
    });

    it('AND-composes with a pre-existing where clause (no neutering)', async () => {
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => ['s1'],
      });
      const instance = new Hook();
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const existing = Where.eq<Pet>('name', 'Rex');
      const original = { where: existing };
      const result = await instance.beforeFindOne(original, ctx);

      expect(result).not.toBe(original);
      expect(result.where).toEqual(
        Where.and(existing, Where.in<Pet>('shelterId', ['s1'])),
      );
    });

    it('scopes the configured column, not a hardcoded one', async () => {
      interface Doc extends PlainLiteralObject {
        readonly orgId: string;
      }
      class DocEntity {
        orgId!: string;
      }
      const Hook = TenantScopeHook.for<Doc>(DocEntity, {
        tenantKey: 'orgId',
        resolve: () => ['o1'],
      });
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const result = await new Hook().beforeFindOne({}, ctx);

      expect(result.where).toEqual(Where.in<Doc>('orgId', ['o1']));
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

      expect(a.where).toEqual(Where.in<Pet>('shelterId', ['s1']));
      expect(b.where).toEqual(Where.in<Pet>('shelterId', ['s2']));
    });

    it('does not mutate the resolved array into the clause by reference', async () => {
      const resolved = ['s1'];
      const Hook = TenantScopeHook.for<Pet>(PetEntity, {
        tenantKey: 'shelterId',
        resolve: () => resolved,
      });
      const ctx = fakeCtx({ actor: { id: 'u1', type: 'user' } });
      const result = await new Hook().beforeFindOne({}, ctx);

      resolved.push('s2');
      expect(result.where).toEqual(Where.in<Pet>('shelterId', ['s1']));
    });
  });
});
