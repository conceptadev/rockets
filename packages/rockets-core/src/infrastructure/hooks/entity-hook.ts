import type { PlainLiteralObject, Type } from '@nestjs/common';
import {
  AfterCount,
  AfterCreate,
  AfterCreateMany,
  AfterDelete,
  AfterFind,
  AfterFindAndCount,
  AfterFindOne,
  AfterReplace,
  AfterRestore,
  AfterSoftDelete,
  AfterUpdate,
  AfterUpsert,
  BeforeCount,
  BeforeCreate,
  BeforeCreateMany,
  BeforeDelete,
  BeforeFind,
  BeforeFindAndCount,
  BeforeFindOne,
  BeforeReplace,
  BeforeRestore,
  BeforeSoftDelete,
  BeforeUpdate,
  BeforeUpsert,
  RepoHook,
  RepoSpec,
  type RepositoryFindOneOptions,
  type RepositoryFindOptions,
} from '@concepta/nestjs-repository';
import { Specification } from '@concepta/nestjs-core';
import type { RocketsCrudContext } from '../../domain/interfaces/rockets-crud-context.interface';
import { deriveEntityKey } from '../../common';

/**
 * # When to reach for `EntityHook` vs Guard / Interceptor / Subscriber
 *
 * | Need                                                 | Use                              |
 * | ---------------------------------------------------- | -------------------------------- |
 * | Filter / mutate repository options or payloads       | `EntityHook` (this file)         |
 * | Block an HTTP request (401/403/404)                  | `CanActivate` Guard              |
 * | Transform the HTTP response envelope                 | `NestInterceptor`                |
 * | React to ORM-level events outside the request scope  | TypeORM `EntitySubscriber`       |
 *
 * Hooks fire for **every repository call**, including non-HTTP ones
 * (background jobs, scheduler, internal services). Guards only fire on
 * HTTP requests. If you throw `HttpException` from a hook the upstream
 * membrane wraps it in `ModelQueryException` and the intended status
 * collapses to 500 — use a Guard instead.
 *
 * # The lifecycle keys
 *
 * One method per upstream `@Before*` / `@After*` decorator. Override
 * what you need; the base methods are abstract — every subclass MUST
 * provide an explicit body even for "I don't care" cases (return the
 * input unchanged). This forces explicit intent and prevents silent
 * no-ops from typo'd method names.
 *
 * # Why context is `RocketsCrudContext` (no `<E>` propagation)
 *
 * The CRUD context is shared across all hooks on a request. A single
 * hook may serve multiple resources (e.g. `AuditLogHook`), so binding
 * the context to one entity type would break re-use. Read the actor via
 * `getActor(ctx)`; read CRUD-only fields (`params`, `operation`,
 * `entity`) via `getCrudContext(ctx)`.
 */
export type EntityHookContext = RocketsCrudContext;

/**
 * Maps lifecycle method name → upstream `@Before*`/`@After*` decorator.
 *
 * Every key here is a method on {@link EntityHookBase}. The
 * `@EntityHook()` decorator iterates the subclass's own prototype and
 * stamps the matching upstream decorator on each override. Methods named
 * outside this map (or near-misses like `beforeFindOnce`) trigger a
 * decoration-time error so silent no-ops cannot ship to production.
 */
export const LIFECYCLE_DECORATORS = {
  beforeFindOne: BeforeFindOne,
  afterFindOne: AfterFindOne,
  beforeFindAndCount: BeforeFindAndCount,
  afterFindAndCount: AfterFindAndCount,
  // `find` and `count` are contract methods like the two above. Leaving
  // them out of this map is why a hand-written `repository.find({ ctx })`
  // came back unscoped while the generated list route was filtered.
  beforeFind: BeforeFind,
  afterFind: AfterFind,
  beforeCount: BeforeCount,
  afterCount: AfterCount,
  beforeCreate: BeforeCreate,
  afterCreate: AfterCreate,
  beforeUpdate: BeforeUpdate,
  afterUpdate: AfterUpdate,
  // Replace is its own channel upstream. Without it here, a PUT body
  // reaches the row with no stamp hook in the way — which is how an
  // owner/tenant column could be reassigned by the client.
  beforeReplace: BeforeReplace,
  afterReplace: AfterReplace,
  beforeUpsert: BeforeUpsert,
  afterUpsert: AfterUpsert,
  beforeCreateMany: BeforeCreateMany,
  afterCreateMany: AfterCreateMany,
  beforeDelete: BeforeDelete,
  afterDelete: AfterDelete,
  beforeSoftDelete: BeforeSoftDelete,
  afterSoftDelete: AfterSoftDelete,
  beforeRestore: BeforeRestore,
  afterRestore: AfterRestore,
} as const;

export type EntityHookLifecycleKey = keyof typeof LIFECYCLE_DECORATORS;

const LIFECYCLE_KEY_SET: ReadonlySet<string> = new Set(
  Object.keys(LIFECYCLE_DECORATORS),
);

/**
 * Every lifecycle upstream wires through `Membrane.object`, whose merge
 * is `Object.assign(fresh, hookResult, originalPayload)` — the ORIGINAL
 * is applied LAST, so it wins every field it already carries. A hook
 * that returns a new object therefore loses exactly the corrections it
 * was written to make (a trimmed name, a redacted column, a stamped
 * owner) while a field the payload did NOT carry survives. The
 * precedence is backwards: the payload is client input or a row on its
 * way out, and the hook is the server's rule.
 *
 * {@link EntityHook} corrects it here, at the one seam both authoring
 * styles pass through — the hook's returned fields are merged back onto
 * the original, so:
 *
 * - mutating the payload in place works (it always did);
 * - returning a new object works (it did not, outside `defineHook`);
 * - returning a PARTIAL object cannot drop a column, because untouched
 *   fields stay on the original.
 *
 * The membrane each channel uses is upstream's choice, not ours, and it
 * is not uniform. Excluded here, with the reason:
 *
 * | Channel(s)                                    | Membrane        | Why excluded                                 |
 * | --------------------------------------------- | --------------- | -------------------------------------------- |
 * | `beforeFind*`, `beforeCount`                  | `objectReplace` | return already used as-is                    |
 * | `afterFindOne`, `afterFindAndCount`           | `objectReplace` | return already used as-is                    |
 * | `afterCount`                                  | `scalar`        | not an object                                |
 * | `beforeCreateMany`, `afterFind`, `afterCreateMany` | `collection` | `Object.assign` over an array merges index-wise, which is a DIFFERENT upstream defect — see the README note on `afterFind` |
 *
 * Why not upstream's `RepoWriteHookOptions { replace: true }`, which
 * routes `before*` writes through `objectReplace`: it makes the return
 * value the WHOLE payload, so a hook that returns a partial object drops
 * every column it did not mention. It also covers only the write
 * `before*` channels, leaving the seven `after*` ones below unfixed. The
 * merge-back is partial-safe and uniform; that is the trade deliberately
 * taken.
 *
 * `entity-hook-merge-back-parity.spec.ts` derives this list from
 * upstream's real membrane behaviour, so an upstream change fails a test
 * instead of silently un-fixing a channel.
 */
const MERGE_BACK_KEYS: ReadonlySet<string> = new Set<EntityHookLifecycleKey>([
  'beforeCreate',
  'beforeUpdate',
  'beforeReplace',
  'beforeUpsert',
  'beforeDelete',
  'beforeSoftDelete',
  'beforeRestore',
  'afterCreate',
  'afterUpdate',
  'afterReplace',
  'afterUpsert',
  'afterDelete',
  'afterSoftDelete',
  'afterRestore',
]);

/**
 * Test-only view of {@link MERGE_BACK_KEYS}. Exported so
 * `entity-hook-merge-back-parity.spec.ts` can assert the list against
 * upstream's real membrane behaviour; not part of the public API (it is
 * not re-exported from the package index).
 */
export const MERGE_BACK_KEYS_FOR_TEST: ReadonlySet<string> = MERGE_BACK_KEYS;

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

/**
 * Applies the hook's returned fields onto the original payload and
 * returns the original, so the reference upstream preserves is the one
 * carrying the hook's changes.
 */
function mergeBack(payload: unknown, result: unknown): unknown {
  if (
    result &&
    typeof result === 'object' &&
    result !== payload &&
    payload &&
    typeof payload === 'object' &&
    // No channel in MERGE_BACK_KEYS carries an array today — the
    // collection ones are excluded for exactly this reason. The guard
    // keeps a future array-shaped channel from being merged index-wise
    // if it is ever added to the list by mistake.
    !Array.isArray(payload) &&
    !Array.isArray(result)
  ) {
    Object.assign(payload, result);
  }
  return payload;
}

/**
 * Wraps a write `before*` override so its return value takes effect
 * regardless of authoring style. Synchronous methods stay synchronous —
 * only a hook that actually returns a thenable is awaited.
 */
function withMergeBack(
  method: (...args: unknown[]) => unknown,
  name: string,
): (...args: unknown[]) => unknown {
  function wrapped(this: unknown, ...args: unknown[]): unknown {
    const [payload] = args;
    const result = method.apply(this, args);
    if (isPromiseLike(result)) {
      return Promise.resolve(result).then((resolved) =>
        mergeBack(payload, resolved),
      );
    }
    return mergeBack(payload, result);
  }
  // Keep the original name so stack traces and the hook resolver's
  // method map read as the author wrote them.
  Object.defineProperty(wrapped, 'name', { value: name });
  return wrapped;
}

/**
 * One-edit Levenshtein check (insertion, deletion, substitution).
 *
 * Used by {@link EntityHook} at decoration time to surface obvious typos
 * — `afterSoftdelete`, `beforeFindOnce` — that would otherwise install as
 * silent no-ops.
 */
function isOneEditAway(a: string, b: string): boolean {
  if (a === b) return false;
  if (Math.abs(a.length - b.length) > 1) return false;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] !== longer[j]) {
      if (++edits > 1) return false;
      if (shorter.length === longer.length) {
        i++;
        j++;
      } else {
        j++;
      }
    } else {
      i++;
      j++;
    }
  }
  return edits + (longer.length - j) === 1;
}

function findNearMissLifecycleKey(name: string): string | undefined {
  for (const key of LIFECYCLE_KEY_SET) {
    if (isOneEditAway(name, key)) return key;
  }
  return undefined;
}

/**
 * Options accepted by {@link EntityHook}.
 *
 * Passing `entity` binds the hook to a specific table at runtime — the
 * decorator auto-applies a class-level `@Specification(RepoSpec.isEntity(...))`
 * so the hook only fires for repository operations on that entity.
 *
 * Without an entity binding the hook can self-recurse: when the hook
 * writes to another table from inside its own `after*` method, the
 * forwarded CRUD context still carries the parent request's `HooksCtx`
 * and the framework re-invokes the same hook on that nested write.
 * `AuditLogHook` is the canonical example — without scoping, every
 * audit-log insert triggers another audit-log insert until the Node heap
 * is exhausted.
 *
 * Hooks that genuinely span more than one entity (rare) should leave
 * `entity` unset and declare their own spec via `@Specification(...)` or
 * per-method `@AfterCreate(RepoSpec.isEntity(...))` decorators.
 */
export interface EntityHookOptions<
  E extends PlainLiteralObject = PlainLiteralObject,
> {
  readonly entity?: Type<E>;
  /**
   * The persistence key the hook's spec matches on, when the resource
   * registers `entity` under a key that is NOT
   * `deriveEntityKey(entity)`.
   *
   * Entity-hook matching upstream is a raw string compare of the running
   * operation's entity key against the key baked into the hook's spec.
   * `defineResource({ entity: PetEntity, key: 'pets' })` is legal and
   * registers the entity as `'pets'`, while `deriveEntityKey(PetEntity)`
   * is `'pet'` — a hook bound by the derived key would then never fire.
   * For a security hook (`TenantScopeHook`, `OwnerScopeHook`) that is a
   * silent, total fail-OPEN.
   *
   * Leaving this unset is the normal case: the planner's
   * `validateEntityHookBindings` rejects a mismatch at BOOT with the
   * actual registered key, so a wrong binding can never reach
   * production silently. Set it only to deliberately match a custom
   * resource `key`.
   */
  readonly entityKey?: string;
}

/**
 * What entity (class + persistence key) an `@EntityHook({ entity })`
 * class is bound to, recorded at decoration time so the planner can
 * verify the binding against the app's entity registry BEFORE boot
 * completes.
 */
export interface EntityHookBinding {
  readonly entity: Type<PlainLiteralObject>;
  readonly entityKey: string;
}

const ENTITY_HOOK_BINDING = Symbol('rockets:entity-hook-binding');

/**
 * Read back the entity binding {@link EntityHook} stamped on a hook
 * class, or `undefined` for a deliberately unbound (multi-entity) hook.
 *
 * Reads **own** metadata only: a class that was not itself decorated
 * with `@EntityHook({ entity })` has no binding of its own, and
 * inheriting its base class's binding would report a spec the upstream
 * hook resolver never actually applied to it.
 */
export function getEntityHookBinding(
  hook: Type<PlainLiteralObject> | Function,
): EntityHookBinding | undefined {
  const binding: unknown = Reflect.getOwnMetadata(ENTITY_HOOK_BINDING, hook);
  return isEntityHookBinding(binding) ? binding : undefined;
}

function isEntityHookBinding(value: unknown): value is EntityHookBinding {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<EntityHookBinding>;
  return (
    typeof candidate.entity === 'function' &&
    typeof candidate.entityKey === 'string'
  );
}

/**
 * Class decorator that turns a subclass of {@link EntityHookBase} into a
 * registered repository hook.
 *
 * Walks the subclass's **own** prototype methods. Any method whose name
 * matches a lifecycle key (`beforeFindOne`, `afterCreate`, …) receives
 * the corresponding upstream method decorator. Inherited abstract no-ops
 * on the base are not stamped, so they don't fire.
 *
 * Throws at decoration time if:
 * - An own method is **near** a lifecycle key but doesn't match exactly
 *   (e.g. `afterSoftdelete` instead of `afterSoftDelete`). Silent typos
 *   are otherwise unrecoverable security bugs (audit row never writes).
 *
 * Apply this once on every subclass — it replaces both `@RepoHook()` and
 * the per-method `@Before*`/`@After*` decorators.
 *
 * @example Pet-scoped hook — only fires on `pet` repository calls.
 * ```ts
 * @EntityHook({ entity: PetEntity })
 * @Injectable()
 * export class PetOwnerScopeHook extends EntityHookBase<PetEntity> {
 *   override beforeFindOne(options, ctx) {
 *     const actor = getActor(ctx);
 *     if (!actor?.id) return options;
 *     return {
 *       ...options,
 *       where: Where.and(options.where, Where.eq('userId', actor.id)),
 *     };
 *   }
 * }
 * ```
 */
export function EntityHook<E extends PlainLiteralObject = PlainLiteralObject>(
  options?: EntityHookOptions<E>,
): ClassDecorator {
  return (target) => {
    // `target` is typed `Function` by `ClassDecorator`. The two reads we
    // need (`name`, `prototype`) are declared on `Function`, but the
    // prototype is keyed by arbitrary strings — narrow once at the top
    // through a `Record<string, unknown>` view rather than per-line casts.
    const className = target.name || 'EntityHook';
    const prototype: Record<string, unknown> = target.prototype;

    // 1. Validate own-prototype method names. Catches case-typo and
    //    near-miss bugs (`afterSoftdelete`, `beforeFindOnce`) that would
    //    otherwise install as silent no-ops.
    for (const name of Object.getOwnPropertyNames(prototype)) {
      if (name === 'constructor') continue;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
      if (!descriptor || typeof descriptor.value !== 'function') continue;
      if (LIFECYCLE_KEY_SET.has(name)) continue;
      if (!/^(before|after)[A-Z]/.test(name)) continue;

      const nearMiss = findNearMissLifecycleKey(name);
      if (nearMiss) {
        throw new Error(
          `@EntityHook() ${className}.${name}: method name looks like a typo of "${nearMiss}". ` +
            `Rename to "${nearMiss}" or move this method off the hook class — ` +
            `near-miss names would otherwise install as silent no-ops.`,
        );
      }
      throw new Error(
        `@EntityHook() ${className}.${name}: looks like a lifecycle ` +
          `channel but has no decorator. Add it to LIFECYCLE_DECORATORS ` +
          `or rename the method — unmapped channels install as silent no-ops.`,
      );
    }

    // 2. Stamp method-level lifecycle metadata on overrides. Iterating own
    //    prototype keys (NOT the chain) ensures the abstract base methods
    //    stay metadata-free and are never registered as hooks.
    for (const name of Object.getOwnPropertyNames(prototype)) {
      if (name === 'constructor') continue;
      if (!LIFECYCLE_KEY_SET.has(name)) continue;
      const lifecycleKey = name as EntityHookLifecycleKey;
      const decorator = LIFECYCLE_DECORATORS[lifecycleKey];
      if (!decorator) {
        throw new Error(
          `@EntityHook() ${className}.${name}: declared lifecycle ` +
            `channel has no decorator in LIFECYCLE_DECORATORS.`,
        );
      }

      const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
      if (!descriptor || typeof descriptor.value !== 'function') continue;

      // 2a. Correct the upstream merge precedence for write payloads
      //     BEFORE the decorator is stamped, so the method the hook
      //     resolver invokes is the wrapped one. See MERGE_BACK_KEYS.
      if (MERGE_BACK_KEYS.has(name)) {
        descriptor.value = withMergeBack(
          descriptor.value as (...args: unknown[]) => unknown,
          name,
        );
        Object.defineProperty(prototype, name, descriptor);
      }

      const methodDecorator = decorator() as MethodDecorator;
      methodDecorator(prototype, name, descriptor);
    }

    // 3. Bind class-level entity scope when `options.entity` is supplied.
    //    `scanHookMethods()` reads `SPECIFICATION_METADATA_KEY` from the
    //    class as the fallback `classSpec` for every lifecycle method, so
    //    the spec applied here is what the hook resolver consults at
    //    runtime — guaranteeing the hook never fires on writes targeted
    //    at a different entity (and therefore never self-recurses).
    //    MUST run before `RepoHook()(target)` because the latter calls
    //    `scanHookMethods()` which captures the class spec.
    //    `options.entityKey` overrides the derived key for resources that
    //    register the entity under a custom `key`; the binding is recorded
    //    so `validateEntityHookBindings` can reject a mismatch at boot
    //    instead of letting the hook silently never fire.
    if (options?.entity) {
      const entityKey = options.entityKey ?? deriveEntityKey(options.entity);
      Specification(RepoSpec.isEntity(entityKey))(target);
      Reflect.defineMetadata(
        ENTITY_HOOK_BINDING,
        { entity: options.entity, entityKey } satisfies EntityHookBinding,
        target,
      );
    }

    // 4. Class-level registration. `RepoHook()` runs `scanHookMethods()`
    //    which walks the prototype chain reading the metadata stamped
    //    above, so this MUST run after the loop.
    RepoHook()(target);
  };
}

/**
 * Abstract repository-hook base class.
 *
 * Every lifecycle method is `abstract` — subclasses must provide a body
 * for the methods they care about and explicitly skip the rest. There
 * is no inherited no-op fallback; this is deliberate, because a typo in
 * an override (`afterSoftdelete` for `afterSoftDelete`) would otherwise
 * leave the base no-op firing and the subclass code never running. Pair
 * with {@link passthroughEntityHook} when a subclass needs explicit
 * "I don't care" defaults for the unused lifecycle keys.
 *
 * The generic `E` is propagated to option/payload arguments so consumers
 * get autocomplete on `where` clauses and stamped fields. The hook
 * **class** cannot be parameterised at use-site (`Hook<Pet>` is a type,
 * not a value); per-resource bindings ship as named subclasses or via
 * the `for<E>()` static factory pattern (see `OwnerScopeHook.for<E>()`).
 */
export abstract class EntityHookBase<E extends PlainLiteralObject> {
  // ---------- Read lifecycle ----------

  abstract beforeFindOne(
    options: RepositoryFindOneOptions<E>,
    ctx?: EntityHookContext,
  ): RepositoryFindOneOptions<E> | Promise<RepositoryFindOneOptions<E>>;

  abstract afterFindOne(
    entity: E | null,
    ctx?: EntityHookContext,
  ): (E | null) | Promise<E | null>;

  abstract beforeFindAndCount(
    options: RepositoryFindOptions<E>,
    ctx?: EntityHookContext,
  ): RepositoryFindOptions<E> | Promise<RepositoryFindOptions<E>>;

  abstract beforeFind(
    options: RepositoryFindOptions<E>,
    ctx?: EntityHookContext,
  ): RepositoryFindOptions<E> | Promise<RepositoryFindOptions<E>>;

  abstract afterFind(
    entities: E[],
    ctx?: EntityHookContext,
  ): E[] | Promise<E[]>;

  abstract beforeCount(
    options: RepositoryFindOptions<E>,
    ctx?: EntityHookContext,
  ): RepositoryFindOptions<E> | Promise<RepositoryFindOptions<E>>;

  abstract afterCount(
    total: number,
    ctx?: EntityHookContext,
  ): number | Promise<number>;

  abstract afterFindAndCount(
    result: { data: E[]; total: number },
    ctx?: EntityHookContext,
  ): { data: E[]; total: number } | Promise<{ data: E[]; total: number }>;

  // ---------- Write lifecycle ----------

  abstract beforeCreate(payload: E, ctx?: EntityHookContext): E | Promise<E>;

  abstract afterCreate(entity: E, ctx?: EntityHookContext): E | Promise<E>;

  abstract beforeUpdate(payload: E, ctx?: EntityHookContext): E | Promise<E>;

  abstract afterUpdate(entity: E, ctx?: EntityHookContext): E | Promise<E>;

  abstract beforeReplace(payload: E, ctx?: EntityHookContext): E | Promise<E>;

  abstract afterReplace(entity: E, ctx?: EntityHookContext): E | Promise<E>;

  abstract beforeUpsert(payload: E, ctx?: EntityHookContext): E | Promise<E>;

  abstract afterUpsert(entity: E, ctx?: EntityHookContext): E | Promise<E>;

  abstract beforeCreateMany(
    payload: E[],
    ctx?: EntityHookContext,
  ): E[] | Promise<E[]>;

  abstract afterCreateMany(
    entities: E[],
    ctx?: EntityHookContext,
  ): E[] | Promise<E[]>;

  // ---------- Delete lifecycle ----------

  abstract beforeDelete(entity: E, ctx?: EntityHookContext): E | Promise<E>;
  abstract afterDelete(entity: E, ctx?: EntityHookContext): E | Promise<E>;

  abstract beforeSoftDelete(entity: E, ctx?: EntityHookContext): E | Promise<E>;
  abstract afterSoftDelete(entity: E, ctx?: EntityHookContext): E | Promise<E>;

  abstract beforeRestore(entity: E, ctx?: EntityHookContext): E | Promise<E>;
  abstract afterRestore(entity: E, ctx?: EntityHookContext): E | Promise<E>;
}

/**
 * Mixin/helper class that fills every {@link EntityHookBase} method with
 * a passthrough no-op. Most hooks override only one or two lifecycle
 * methods; extending {@link PassthroughEntityHookBase} avoids forcing
 * each subclass to declare 24 abstract bodies just to skip them.
 *
 * The passthroughs are explicit (one method per key, body returns the
 * input unchanged). Because they are concrete declarations on this
 * class, the `noImplicitOverride` and `override` keyword still apply to
 * subclass overrides — typos like `afterSoftdelete` are caught at the
 * `@EntityHook()` decorator boundary.
 */
export abstract class PassthroughEntityHookBase<
  E extends PlainLiteralObject,
> extends EntityHookBase<E> {
  beforeFindOne(
    options: RepositoryFindOneOptions<E>,
    _ctx?: EntityHookContext,
  ): RepositoryFindOneOptions<E> | Promise<RepositoryFindOneOptions<E>> {
    return options;
  }
  afterFindOne(
    entity: E | null,
    _ctx?: EntityHookContext,
  ): (E | null) | Promise<E | null> {
    return entity;
  }
  beforeFindAndCount(
    options: RepositoryFindOptions<E>,
    _ctx?: EntityHookContext,
  ): RepositoryFindOptions<E> | Promise<RepositoryFindOptions<E>> {
    return options;
  }
  beforeFind(
    options: RepositoryFindOptions<E>,
    _ctx?: EntityHookContext,
  ): RepositoryFindOptions<E> | Promise<RepositoryFindOptions<E>> {
    return options;
  }
  afterFind(entities: E[], _ctx?: EntityHookContext): E[] | Promise<E[]> {
    return entities;
  }
  beforeCount(
    options: RepositoryFindOptions<E>,
    _ctx?: EntityHookContext,
  ): RepositoryFindOptions<E> | Promise<RepositoryFindOptions<E>> {
    return options;
  }
  afterCount(
    total: number,
    _ctx?: EntityHookContext,
  ): number | Promise<number> {
    return total;
  }
  afterFindAndCount(
    result: { data: E[]; total: number },
    _ctx?: EntityHookContext,
  ): { data: E[]; total: number } | Promise<{ data: E[]; total: number }> {
    return result;
  }
  beforeCreate(payload: E, _ctx?: EntityHookContext): E | Promise<E> {
    return payload;
  }
  afterCreate(entity: E, _ctx?: EntityHookContext): E | Promise<E> {
    return entity;
  }
  beforeUpdate(payload: E, _ctx?: EntityHookContext): E | Promise<E> {
    return payload;
  }
  afterUpdate(entity: E, _ctx?: EntityHookContext): E | Promise<E> {
    return entity;
  }
  beforeReplace(payload: E, _ctx?: EntityHookContext): E | Promise<E> {
    return payload;
  }
  afterReplace(entity: E, _ctx?: EntityHookContext): E | Promise<E> {
    return entity;
  }
  beforeUpsert(payload: E, _ctx?: EntityHookContext): E | Promise<E> {
    return payload;
  }
  afterUpsert(entity: E, _ctx?: EntityHookContext): E | Promise<E> {
    return entity;
  }
  beforeCreateMany(payload: E[], _ctx?: EntityHookContext): E[] | Promise<E[]> {
    return payload;
  }
  afterCreateMany(entities: E[], _ctx?: EntityHookContext): E[] | Promise<E[]> {
    return entities;
  }
  beforeDelete(entity: E, _ctx?: EntityHookContext): E | Promise<E> {
    return entity;
  }
  afterDelete(entity: E, _ctx?: EntityHookContext): E | Promise<E> {
    return entity;
  }
  beforeSoftDelete(entity: E, _ctx?: EntityHookContext): E | Promise<E> {
    return entity;
  }
  afterSoftDelete(entity: E, _ctx?: EntityHookContext): E | Promise<E> {
    return entity;
  }
  beforeRestore(entity: E, _ctx?: EntityHookContext): E | Promise<E> {
    return entity;
  }
  afterRestore(entity: E, _ctx?: EntityHookContext): E | Promise<E> {
    return entity;
  }
}

/**
 * Marker that an entity carries the conventional `userId` ownership
 * column. Hooks like {@link OwnerScopeHook} constrain their generic entity
 * type to `OwnedEntity` so missing the column surfaces as a compile-time
 * error.
 *
 * For entities with a different ownership column (e.g. `createdBy`,
 * `ownerId`, `authorId`) declare your own marker interface and a
 * dedicated subclass — `OwnedEntity` is intentionally column-specific
 * so the type-level check actually checks something.
 */
export interface OwnedEntity {
  readonly userId: string;
}

/**
 * Nest DI token for a repository hook class used in
 * `defineResource({ hooks })`, `defineSubResource`, and per-operation
 * `hooks` entries.
 *
 * Hooks are bound to **a specific entity** at the type level. A hook
 * declared as `EntityHookBase<PetEntity>` only fits a resource whose
 * `entity: PetEntity`. The previous `<PlainLiteralObject>` escape hatch
 * is gone on purpose — it allowed reusable hooks (audit, indexers) to
 * silently fire on every entity in scope, including their own internal
 * writes, which self-recursed.
 *
 * Reusable hooks must now expose a static `.for(EntityClass)` factory
 * that produces a per-entity subclass decorated with the correct
 * `@EntityHook({ entity })`. Consumers write
 * `hooks: [AuditLogHook.for(PetEntity)]`, locking the entity at the
 * type level AND in runtime.
 *
 * Arbitrary `Type` / plain classes are rejected at compile time — every
 * hook must extend {@link EntityHookBase} or {@link PassthroughEntityHookBase}
 * and be decorated with {@link EntityHook}.
 */
export type RocketsEntityHookForResource<E extends PlainLiteralObject> =
  | Type<EntityHookBase<E>>
  | Type<PassthroughEntityHookBase<E>>;
