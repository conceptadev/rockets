import { Injectable, type PlainLiteralObject, type Type } from '@nestjs/common';
import { type RepositoryInterface, Where } from '@concepta/nestjs-repository';

import {
  EntityHook,
  type EntityHookContext,
  PassthroughEntityHookBase,
} from './entity-hook';
import { deriveEntityKey } from '../../common';
import { InjectDynamicRepository } from '../../common';

/**
 * Re-fetches the persisted row by primary key after an entity is created
 * and copies the loaded fields onto the original `created` instance.
 *
 * Why this exists: many ORMs (notably TypeORM) return only persisted
 * columns from `save()`. Eager-loaded relations declared on the entity
 * (`@ManyToOne(..., { eager: true })`) are absent on the create response.
 * Re-fetching by id triggers the eager load. The upstream `AfterCreate`
 * membrane uses a `preserve` strategy (original entity wins for
 * pre-existing keys), so we mutate the `created` object in place — a
 * returned object would be discarded for keys already on it.
 *
 * Bind via `AfterCreateReloadHook.for(EntityClass)` and add to a resource
 * via `hooks: [AfterCreateReloadHook.for(PetEntity)]`. The generated
 * subclass is decorated with `@EntityHook({ entity })` so it only fires
 * on its own entity's writes — internal repository writes to other
 * entities (from sibling hooks) never re-trigger it.
 *
 * Trade-off: each create triggers an extra DB read. Use only on resources
 * whose entities declare eager relations that consumers depend on.
 *
 * The reload forwards the hook's `ctx`, which matters twice:
 *
 * - **Transaction.** `getRepo(ctx)` on the TypeORM adapter returns the
 *   transaction's repository only when the context carries `TrxCtx`;
 *   otherwise it returns the default one, backed by a different
 *   `EntityManager`. Under `transactional: true` the row is still
 *   uncommitted, so on any driver that hands transactions a dedicated
 *   connection (Postgres, MySQL) the reload finds nothing and the eager
 *   relation silently vanishes from the create response. It happens to
 *   work on in-memory SQLite because the transaction shares the one
 *   connection — which is exactly why no e2e here can catch it.
 * - **Hooks.** The reload now runs the entity's own read hooks, so the
 *   create response shows what a read would show. A column a read hook
 *   hides no longer reappears on the way out of a create.
 */
@EntityHook()
@Injectable()
export abstract class AfterCreateReloadHook<
  E extends PlainLiteralObject,
> extends PassthroughEntityHookBase<E> {
  protected repo!: RepositoryInterface<E>;

  override async afterCreate(created: E, ctx?: EntityHookContext): Promise<E> {
    const id = (created as { id?: unknown }).id;
    if (typeof id !== 'string' || id.length === 0) return created;
    const reloaded = (await this.repo.findOne({
      where: Where.eq<E>('id' as keyof E & string, id),
      ctx,
    })) as E | null;
    if (!reloaded) return created;
    // Assign alone cannot REMOVE a key: a column a read hook deleted
    // from `reloaded` (the whole point of reloading through the read
    // path) stayed on `created` from the raw save() result — the hidden
    // column leaked exactly on the create response the docstring
    // promises it will not. Drop keys the read view does not carry,
    // then merge; `created`'s object identity is preserved for the
    // callers holding the reference.
    const record = created as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (!(key in reloaded)) {
        delete record[key];
      }
    }
    Object.assign(record, reloaded);
    return created;
  }

  /**
   * Static factory binding the entity on a cached named subclass.
   * Subclass cache keyed by `entity` class so distinct entities receive
   * distinct provider tokens. The cached subclass is decorated with
   * `@EntityHook({ entity })` so the upstream hook resolver scopes it
   * to that entity's writes only.
   */
  static for<E extends PlainLiteralObject>(
    entity: Type<E>,
  ): Type<AfterCreateReloadHook<E>>;
  static for(
    entity: Type<PlainLiteralObject>,
  ): Type<AfterCreateReloadHook<PlainLiteralObject>> {
    return getAfterCreateReloadSubclass(entity);
  }
}

// WeakMap, not Map: the key is the entity CLASS. A strong-keyed cache
// would pin every entity (and its module closure) for the process
// lifetime. Matches schema-registry.ts / paginated-dto.factory.ts.
const subclassCache = new WeakMap<
  Type<PlainLiteralObject>,
  Type<AfterCreateReloadHook<PlainLiteralObject>>
>();

function getAfterCreateReloadSubclass(
  entity: Type<PlainLiteralObject>,
): Type<AfterCreateReloadHook<PlainLiteralObject>> {
  const existing = subclassCache.get(entity);
  if (existing) return existing;

  const entityKey = deriveEntityKey(entity);
  const className = `AfterCreateReloadHook_${entity.name}`;
  const Subclass: Type<
    AfterCreateReloadHook<PlainLiteralObject>
  > = class extends AfterCreateReloadHook<PlainLiteralObject> {
    constructor(repo: RepositoryInterface<PlainLiteralObject>) {
      super();
      this.repo = repo;
    }
  };
  Object.defineProperty(Subclass, 'name', { value: className });

  const inject: ParameterDecorator = InjectDynamicRepository(entityKey);
  inject(Subclass, undefined, 0);
  EntityHook({ entity })(Subclass);
  Injectable()(Subclass);

  subclassCache.set(entity, Subclass);
  return Subclass;
}
