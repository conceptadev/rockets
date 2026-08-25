import { describe, it, expect } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  type PlainLiteralObject,
  UnauthorizedException,
} from '@nestjs/common';
import type { OverlayRef } from '@concepta/nestjs-core';
import { TenantStampHook } from './tenant-stamp.hook';
import { getEntityHookBinding } from './entity-hook';
import { ActorCtx } from '../interceptors/actor.overlay';
import type { EntityHookContext } from './entity-hook';

interface Pet extends PlainLiteralObject {
  id: string;
  name: string;
  shelterId: string;
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
    operation: 'create',
    action: 'create',
    supports: (ref: OverlayRef<string, PlainLiteralObject, unknown[]>) =>
      ref === ActorCtx,
    with: (ref: OverlayRef<string, PlainLiteralObject, unknown[]>) => {
      if (ref === ActorCtx) return args.actor;
      return undefined;
    },
  };
  return ctx as unknown as EntityHookContext;
}

const u1 = fakeCtx({ actor: { id: 'u1', type: 'user' } });

function hookFor(resolve: () => readonly string[]) {
  const Hook = TenantStampHook.for<Pet>(PetEntity, {
    tenantKey: 'shelterId',
    resolve,
  });
  return new Hook();
}

function payload(over: Partial<Pet> = {}): Pet {
  return { id: 'p1', name: 'Rex', ...over } as Pet;
}

describe('TenantStampHook.for() factory', () => {
  it('returns a class that extends TenantStampHook', () => {
    expect(hookFor(() => ['s1'])).toBeInstanceOf(TenantStampHook);
  });

  it('binds the derived entity key by default and an explicit one on request', () => {
    const Derived = TenantStampHook.for<Pet>(PetEntity, {
      tenantKey: 'shelterId',
      resolve: () => ['s1'],
    });
    const Custom = TenantStampHook.for<Pet>(PetEntity, {
      tenantKey: 'shelterId',
      resolve: () => ['s1'],
      entityKey: 'pets',
    });
    expect(getEntityHookBinding(Derived)).toEqual({
      entity: PetEntity,
      entityKey: 'pet',
    });
    expect(getEntityHookBinding(Custom)).toEqual({
      entity: PetEntity,
      entityKey: 'pets',
    });
  });
});

describe('TenantStampHook — create', () => {
  it('stamps the single resolved tenant id when the payload omits it', async () => {
    const result = await hookFor(() => ['s1']).beforeCreate(payload(), u1);
    expect(result.shelterId).toBe('s1');
  });

  it('passes a payload value that is inside the resolved set through unchanged', async () => {
    const result = await hookFor(() => ['s1', 's2']).beforeCreate(
      payload({ shelterId: 's2' }),
      u1,
    );
    expect(result.shelterId).toBe('s2');
  });

  it('REJECTS a payload value outside the resolved set — never silently rewrites it', async () => {
    const hook = hookFor(() => ['s1']);
    await expect(
      hook.beforeCreate(payload({ shelterId: 's-other' }), u1),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects when the actor resolves to no tenant at all', async () => {
    await expect(
      hookFor(() => []).beforeCreate(payload(), u1),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects an omitted value as ambiguous when the actor has several tenants', async () => {
    await expect(
      hookFor(() => ['s1', 's2']).beforeCreate(payload(), u1),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('treats an empty-string tenant value as absent, not as a value to validate', async () => {
    const result = await hookFor(() => ['s1']).beforeCreate(
      payload({ shelterId: '' }),
      u1,
    );
    expect(result.shelterId).toBe('s1');
  });

  it('requires an authenticated actor', async () => {
    await expect(
      hookFor(() => ['s1']).beforeCreate(payload(), fakeCtx()),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('mutates the payload in place — the upstream membrane discards a returned copy', async () => {
    const original = payload();
    const result = await hookFor(() => ['s1']).beforeCreate(original, u1);
    expect(result).toBe(original);
    expect(original.shelterId).toBe('s1');
  });
});

describe('TenantStampHook — update', () => {
  it('REJECTS a payload that would move the row into another tenant (the #69 write gap)', async () => {
    await expect(
      hookFor(() => ['s1']).beforeUpdate(payload({ shelterId: 's-other' }), u1),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows a move between two tenants the actor legitimately belongs to', async () => {
    const result = await hookFor(() => ['s1', 's2']).beforeUpdate(
      payload({ shelterId: 's2' }),
      u1,
    );
    expect(result.shelterId).toBe('s2');
  });

  it('leaves an omitted tenant key absent rather than stamping one', async () => {
    const result = await hookFor(() => ['s1']).beforeUpdate(payload(), u1);
    expect(result.shelterId).toBeUndefined();
  });

  it('does not treat a multi-tenant actor omitting the key as ambiguous on update', async () => {
    const result = await hookFor(() => ['s1', 's2']).beforeUpdate(
      payload(),
      u1,
    );
    expect(result.shelterId).toBeUndefined();
  });

  it('rejects a write from an actor who now belongs to no tenant', async () => {
    await expect(
      hookFor(() => []).beforeUpdate(payload({ shelterId: 's1' }), u1),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
