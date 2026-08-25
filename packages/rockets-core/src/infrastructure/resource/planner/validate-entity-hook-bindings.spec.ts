import { describe, it, expect } from 'vitest';
import { Injectable, type PlainLiteralObject, type Type } from '@nestjs/common';
import type { CrudResource } from '../../../domain/interfaces/rockets-resource-bundle.interface';
import { ResourceKind } from '../../../domain/interfaces/resource-kind.enum';
import { EntityHook, PassthroughEntityHookBase } from '../../hooks/entity-hook';
import type { EntityRegistry } from './entity-registry';
import { validateEntityHookBindings } from './validate-entity-hook-bindings';

class PetEntity {
  id!: string;
}
class GhostEntity {
  id!: string;
}

function boundHook(entity: Type<PlainLiteralObject>, entityKey?: string): Type {
  @Injectable()
  class Hook extends PassthroughEntityHookBase<PlainLiteralObject> {}
  EntityHook({ entity, ...(entityKey ? { entityKey } : {}) })(Hook);
  return Hook;
}

/** Deliberately unbound — the documented multi-entity case. */
function unboundHook(): Type {
  @EntityHook()
  @Injectable()
  class Hook extends PassthroughEntityHookBase<PlainLiteralObject> {}
  return Hook;
}

function resource(key: string, hooks: ReadonlyArray<Type>): CrudResource {
  return {
    kind: ResourceKind.Crud,
    meta: { key, entityClass: PetEntity, relations: [], hooks },
  } as unknown as CrudResource;
}

const registry: EntityRegistry = new Map<Type<PlainLiteralObject>, string>([
  [PetEntity, 'pets'],
]);

describe('validateEntityHookBindings', () => {
  it('accepts a hook whose entityKey matches the registered key', () => {
    expect(() =>
      validateEntityHookBindings(
        [resource('pets', [boundHook(PetEntity, 'pets')])],
        registry,
      ),
    ).not.toThrow();
  });

  it('rejects a hook bound to the derived key when the resource registers another', () => {
    expect(() =>
      validateEntityHookBindings(
        [resource('pets', [boundHook(PetEntity)])],
        registry,
      ),
    ).toThrow(
      /matches entity key "pet", but `PetEntity` is registered under "pets"/,
    );
  });

  it('rejects a hook bound to an entity no resource registers at all', () => {
    expect(() =>
      validateEntityHookBindings(
        [resource('pets', [boundHook(GhostEntity)])],
        registry,
      ),
    ).toThrow(/`GhostEntity`, which is not registered in this RocketsModule/);
  });

  it('skips a deliberately unbound multi-entity hook rather than reporting it', () => {
    expect(() =>
      validateEntityHookBindings([resource('pets', [unboundHook()])], registry),
    ).not.toThrow();
  });

  it('names the offending resource key so the message points at one bundle', () => {
    expect(() =>
      validateEntityHookBindings(
        [resource('pets', [boundHook(PetEntity)])],
        registry,
      ),
    ).toThrow(/buildAppRegistrationPlan\[pets\]/);
  });
});
