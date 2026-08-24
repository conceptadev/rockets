import { Injectable, type PlainLiteralObject, type Type } from '@nestjs/common';
import {
  type RepositoryFindOneOptions,
  type RepositoryFindOptions,
  Where,
} from '@concepta/nestjs-repository';
import type { Actor } from '../../domain/interfaces/actor.interface';
import { getActor } from '../../utils/get-actor.helper';
import {
  EntityHook,
  type EntityHookContext,
  PassthroughEntityHookBase,
} from './entity-hook';

export type TenantIdsResolver = (
  actor: Actor,
) => readonly string[] | Promise<readonly string[]>;

export interface TenantScopeOptions<E extends PlainLiteralObject> {
  readonly tenantKey: keyof E & string;
  /**
   * Returns the tenant ids the actor may see. An empty array means "this
   * actor owns none" — list returns nothing, read finds nothing. Never
   * return every tenant id as a substitute for "no restriction"; there is
   * no way to opt an actor out of scoping from inside `resolve` by
   * design (see class doc).
   */
  readonly resolve: TenantIdsResolver;
}

/**
 * Reusable repository hook that scopes list/read to rows whose
 * `tenantKey` is in the set `resolve(actor)` returns (issue #69) —
 * fail-closed by construction: no actor, or an empty resolved set, both
 * produce a WHERE clause matching NOTHING, never an unfiltered query.
 *
 * Complements `#51`'s ACL: `acl` decides WHICH ACTIONS an actor may
 * perform; this decides WHICH ROWS. Use both together — `acl` without
 * this still lets an authorized-to-`read` actor see every OTHER tenant's
 * rows on `GET /pets`.
 *
 * ## Why not `OwnerScopeHook`
 *
 * `OwnerScopeHook` compares a column to `actor.id` directly (one owner,
 * one id) and — deliberately — leaves options UNCHANGED when there is no
 * actor, reasoning that an unauthenticated request on a protected route
 * already failed upstream. This hook targets a DIFFERENT case: an actor
 * who legitimately belongs to zero-or-more tenants (a resolved SET, not
 * their own id), where "no actor" or "resolves to nothing" must still
 * deny — the row-scoping equivalent of the CanAccess default in #51,
 * which is exactly the fail-open gap this issue exists to close.
 *
 * ## Coverage
 *
 * | Operation | Repository call    | Hook fired            |
 * | --------- | ------------------ | ---------------------- |
 * | List      | `findAndCount`     | `beforeFindAndCount`  |
 * | Read      | `findOne`          | `beforeFindOne`       |
 * | Update    | `findOne` + update | `beforeFindOne`       |
 * | Delete    | `findOne` + delete | `beforeFindOne`       |
 *
 * A row outside the resolved set is excluded by the query itself, so it
 * surfaces as 404 (never found), not 403 — deliberately: confirming a
 * row EXISTS to an actor who cannot see it is its own leak. Create is
 * not scoped here; stamp the tenant column on writes the same way
 * `OwnerStampHook` stamps ownership.
 *
 * @example
 * ```ts
 * defineResource({
 *   entity: PetEntity,
 *   hooks: [
 *     TenantScopeHook.for<PetEntity>(PetEntity, {
 *       tenantKey: 'shelterId',
 *       resolve: (actor) => shelterIdsFor(actor), // [] when the actor owns none
 *     }),
 *   ],
 * });
 * ```
 */
@EntityHook()
@Injectable()
export abstract class TenantScopeHook<
  E extends PlainLiteralObject,
> extends PassthroughEntityHookBase<E> {
  protected abstract readonly tenantKey: keyof E & string;
  protected abstract readonly resolveTenantIds: TenantIdsResolver;

  override async beforeFindAndCount(
    options: RepositoryFindOptions<E>,
    ctx?: EntityHookContext,
  ): Promise<RepositoryFindOptions<E>> {
    return this.withTenantFilter(options, ctx);
  }

  override async beforeFindOne(
    options: RepositoryFindOneOptions<E>,
    ctx?: EntityHookContext,
  ): Promise<RepositoryFindOneOptions<E>> {
    return this.withTenantFilter(options, ctx);
  }

  /**
   * Static factory mirroring `OwnerScopeHook.for` — binds the entity,
   * tenant column, and resolver on a generated subclass (NestJS DI needs
   * a class per hook, and the resolver is a closure, so it cannot be a
   * constructor argument the container would know how to supply).
   *
   * Unlike `OwnerScopeHook.for`, this is NOT cached per
   * `(entity, tenantKey)`: two calls could legitimately carry different resolvers
   * (different tenant semantics for the same column in two resources),
   * and silently reusing whichever resolver arrived first would be a
   * hard-to-notice authorization bug. Call it once per resource.
   */
  static for<E extends PlainLiteralObject>(
    entity: Type<E>,
    options: TenantScopeOptions<E>,
  ): Type<TenantScopeHook<E>> {
    const className = `TenantScopeHook_${entity.name}_${options.tenantKey}`;
    const ctor = {
      [className]: class extends TenantScopeHook<E> {
        protected readonly tenantKey = options.tenantKey;
        protected readonly resolveTenantIds = options.resolve;
      },
    }[className] as Type<TenantScopeHook<E>>;

    // Same reasoning as `OwnerScopeHook`: without an entity-scoped spec
    // this fires on every entity in the request, including writes made
    // by sibling hooks — silently scoping the wrong table.
    EntityHook({ entity })(ctor);
    Injectable()(ctor);
    return ctor;
  }

  private async withTenantFilter<
    T extends RepositoryFindOptions<E> | RepositoryFindOneOptions<E>,
  >(options: T, ctx?: EntityHookContext): Promise<T> {
    const actor = getActor(ctx);
    // Fail-closed: no actor at all is NOT "let it through" here, unlike
    // `OwnerScopeHook` — see the class doc for why the two hooks disagree
    // on purpose.
    const tenantIds = actor ? await this.resolveTenantIds(actor) : [];

    const tenantClause =
      tenantIds.length > 0
        ? Where.in<E>(this.tenantKey, [...tenantIds])
        : alwaysFalse<E>(this.tenantKey);

    return {
      ...options,
      where: options.where
        ? Where.and(options.where, tenantClause)
        : tenantClause,
    };
  }
}

/**
 * A WHERE clause guaranteed to match zero rows on every backend this
 * package supports, expressed with the SAME portable `Where` DSL rather
 * than a raw empty `IN ()` — several SQL engines (and TypeORM's own
 * `In([])` historically) do not treat an empty IN-list as "match
 * nothing" reliably. A column being simultaneously NULL and NOT NULL is
 * a contradiction no backend can satisfy, so this needs no per-adapter
 * special case.
 */
function alwaysFalse<E extends PlainLiteralObject>(field: keyof E & string) {
  return Where.and(Where.isNull<E>(field), Where.notNull<E>(field));
}
