import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  type PlainLiteralObject,
  type Type,
  UnauthorizedException,
} from '@nestjs/common';
import { getActor } from '../../utils/get-actor.helper';
import {
  EntityHook,
  type EntityHookContext,
  PassthroughEntityHookBase,
} from './entity-hook';
import type { TenantScopeOptions } from './tenant-scope.hook';

/**
 * Write-side complement to `TenantScopeHook` (issue #69): keeps the
 * tenant column of a row inside the set `resolve(actor)` returns, on
 * `create` AND on `update`/`replace`.
 *
 * ## Why this is a separate hook and not something `TenantScopeHook` does
 *
 * `TenantScopeHook` only rewrites `where` clauses — `beforeFindAndCount`
 * and `beforeFindOne`. It decides which rows an actor can REACH; it says
 * nothing about what an actor may WRITE into the tenant column of a row
 * they legitimately reached. Without this hook:
 *
 * - `POST /pets` with `{"shelterId":"someone-elses"}` creates a row in
 *   another tenant.
 * - `PATCH /pets/:id` with `{"shelterId":"someone-elses"}` MOVES the
 *   actor's own row out of their tenant — after which they can no longer
 *   see it, and the other tenant can.
 *
 * `OwnerStampHook` does NOT cover this case: it stamps `actor.id` into an
 * ownership column. A tenant id is a different value entirely (an actor
 * belongs to zero or more tenants, none of which is their user id), so
 * pointing `OwnerStampHook` at a tenant column writes the actor's user id
 * into it and corrupts the data.
 *
 * ## Behaviour
 *
 * | Incoming `tenantKey` value | Result                                     |
 * | -------------------------- | ------------------------------------------ |
 * | in the resolved set        | passes through unchanged                   |
 * | any other value            | `403 Forbidden` — never silently rewritten |
 * | absent, resolved set has 1 | stamped with that id (create only)         |
 * | absent, resolved set has 0 | `403 Forbidden`                            |
 * | absent, resolved set has 2+| `400 Bad Request` — ambiguous, must specify|
 * | no actor in context        | `401 Unauthorized`                         |
 *
 * A forbidden value is **rejected, not overwritten** — the opposite of
 * `OwnerStampHook`, deliberately. There is exactly one legal owner id
 * (`actor.id`), so silently correcting it is unambiguous; there can be
 * several legal tenant ids, so silently picking one would persist a row
 * somewhere the caller did not ask for and did not learn about.
 *
 * On `update` an absent tenant key is left absent rather than stamped:
 * `TenantScopeHook`'s scoped `findOne` already proved the row is inside
 * the actor's set, and stamping would rewrite a multi-tenant actor's row
 * to an arbitrary one of their tenants.
 *
 * Pass the SAME `resolve` you gave `TenantScopeHook` — two resolvers that
 * disagree is the bug this pairing exists to prevent.
 *
 * ## Requires `RocketsCoreExceptionsFilter`
 *
 * The upstream membrane wraps anything a hook throws in a
 * `RepositoryQueryException`, so without that filter registered
 * (`{ provide: APP_FILTER, useClass: RocketsCoreExceptionsFilter }`) every
 * rejection below reaches the client as a generic `500`. The row is still
 * NOT written — the guarantee holds either way — but the status is
 * useless to the caller. `OwnerStampHook` has the same dependency.
 *
 * @example
 * ```ts
 * const shelterScope = { tenantKey: 'shelterId', resolve: shelterIdsFor };
 *
 * defineResource({
 *   entity: PetEntity,
 *   hooks: [
 *     TenantScopeHook.for<PetEntity>(PetEntity, shelterScope),
 *     TenantStampHook.for<PetEntity>(PetEntity, shelterScope),
 *   ],
 * });
 * ```
 */
@EntityHook()
@Injectable()
export abstract class TenantStampHook<
  E extends PlainLiteralObject,
> extends PassthroughEntityHookBase<E> {
  protected abstract readonly tenantKey: keyof E & string;
  protected abstract readonly resolveTenantIds: TenantScopeOptions<E>['resolve'];

  override async beforeCreate(payload: E, ctx?: EntityHookContext): Promise<E> {
    return this.enforceTenant(payload, ctx, true);
  }

  override async beforeUpdate(payload: E, ctx?: EntityHookContext): Promise<E> {
    return this.enforceTenant(payload, ctx, false);
  }

  /**
   * Static factory mirroring {@link TenantScopeHook.for} — binds entity,
   * tenant column and resolver on a generated subclass, and (like it) is
   * deliberately NOT cached, because two calls can carry different
   * resolvers for the same column.
   */
  static for<E extends PlainLiteralObject>(
    entity: Type<E>,
    options: TenantScopeOptions<E>,
  ): Type<TenantStampHook<E>> {
    const className = `TenantStampHook_${entity.name}_${options.tenantKey}`;
    const ctor = {
      [className]: class extends TenantStampHook<E> {
        protected readonly tenantKey = options.tenantKey;
        protected readonly resolveTenantIds = options.resolve;
      },
    }[className] as Type<TenantStampHook<E>>;

    EntityHook({
      entity,
      ...(options.entityKey ? { entityKey: options.entityKey } : {}),
    })(ctor);
    Injectable()(ctor);
    return ctor;
  }

  private async enforceTenant(
    payload: E,
    ctx: EntityHookContext | undefined,
    stampWhenAbsent: boolean,
  ): Promise<E> {
    const actor = getActor(ctx);
    if (!actor?.id) {
      throw new UnauthorizedException(
        `${this.tenantKey} enforcement requires an authenticated actor`,
      );
    }

    const tenantIds = await this.resolveTenantIds(actor);

    // Mutate in place: the upstream `BeforeCreate` / `BeforeUpdate`
    // membrane merges with a `preserve` strategy where the original
    // payload wins over any object the hook returns, so a stamped copy
    // would be silently discarded. Same invariant as `OwnerStampHook`.
    //
    // The runtime column name is opaque to TS (`tenantKey` is any
    // `string` key of `E`), so the indexed read/write goes through a
    // `Record<string, unknown>` view; the compile-time guarantee that it
    // names a field on `E` lives in `TenantScopeOptions['tenantKey']`.
    const indexed: Record<string, unknown> = payload;
    const supplied = indexed[this.tenantKey];

    if (supplied !== undefined && supplied !== null && supplied !== '') {
      if (!tenantIds.includes(String(supplied))) {
        throw new ForbiddenException(
          `${this.tenantKey} "${String(
            supplied,
          )}" is outside your permitted scope`,
        );
      }
      return payload;
    }

    if (!stampWhenAbsent) return payload;

    if (tenantIds.length === 0) {
      throw new ForbiddenException(
        `cannot set ${this.tenantKey}: you belong to no permitted scope`,
      );
    }
    if (tenantIds.length > 1) {
      throw new BadRequestException(
        `${this.tenantKey} is required: you belong to more than one permitted scope`,
      );
    }

    indexed[this.tenantKey] = tenantIds[0];
    return payload;
  }
}
