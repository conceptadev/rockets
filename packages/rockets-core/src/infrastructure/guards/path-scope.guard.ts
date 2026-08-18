import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import { AppContextHost, HooksCtx } from '@concepta/nestjs-core';
import {
  RepoHook,
  RepositoryInterface,
  Where,
} from '@concepta/nestjs-repository';
import type { AuthorizedUser } from '../../domain/interfaces/auth-user.interface';
import { InjectDynamicRepository } from '../../common';
import { ActorCtx } from '../interceptors/actor.overlay';

interface RequestWithUserAndParams {
  user?: AuthorizedUser;
  params?: Record<string, unknown>;
}

/**
 * Generic guard that scopes a sub-resource by the parent's URL param.
 *
 * Auto-injected by `defineSubResource` (via `defineResource`) so every
 * nested route enforces:
 *
 * 1. Authenticated actor (`401` otherwise).
 * 2. Parent entity exists with `ownerColumn === actor.id` (`404` otherwise
 *    — same response for "missing" and "not yours" so a stranger cannot
 *    probe parent existence).
 * 3. The parent is visible to the parent resource's own entity hooks —
 *    a parent hidden by a `beforeFindOne` / `afterFindOne` hook (soft
 *    expiry, tenant scope, retention) is a `404` here too.
 *
 * Sub-resources that need extra checks (e.g. body validation against a
 * lookup table) declare their own guard via `decorators: [UseGuards(X)]`.
 *
 * Bind via `PathScopeGuard.for(parentParam, parentEntityKey, ownerColumn)`.
 *
 * Why a Guard (not a Hook): Guards run before the CRUD pipeline so any
 * `HttpException` they throw propagates with the intended status. A
 * `Before*` repo hook that throws gets wrapped to a generic 500 by the
 * upstream membrane.
 *
 * Why the parent hooks are re-declared on a private context instead of
 * reusing the request's: `AppContextHost.defineOverlay` is first-write-
 * wins, and `HookContextOverlay` (an `APP_INTERCEPTOR`) has not run yet
 * when guards execute. Defining `HooksCtx` on the request here would
 * pin the PARENT's hooks onto the whole request and the sub-resource's
 * own hooks would never attach. The parent lookup therefore runs on a
 * detached context carrying only the parent's hooks and the actor — and
 * deliberately outside any operation transaction, which has not started
 * at guard time either.
 */
@Injectable()
export abstract class PathScopeGuard implements CanActivate {
  protected parentParam = '';
  protected parentEntityKey = '';
  protected ownerColumn = '';
  /** Primary-key column on the parent entity. Defaults to `'id'`. */
  protected parentPk = 'id';
  /** Parent resource's entity hooks, replayed for the parent lookup. */
  protected parentHooks: readonly Type[] = [];
  protected parentRepo!: RepositoryInterface<Record<string, unknown>>;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUserAndParams>();

    const actorId = req?.user?.id;
    if (!actorId) {
      throw new UnauthorizedException(
        `Authenticated actor required to access ${this.parentEntityKey} sub-resource`,
      );
    }

    const paramValue = req?.params?.[this.parentParam];
    const parentId = typeof paramValue === 'string' ? paramValue : undefined;
    if (!parentId) {
      throw new NotFoundException(
        `${this.parentParam} path parameter is required`,
      );
    }

    const parent = await this.parentRepo.findOne({
      where: Where.and(
        Where.eq<Record<string, unknown>>(this.parentPk, parentId),
        Where.eq<Record<string, unknown>>(this.ownerColumn, actorId),
      ),
      // Only existence + ownership matter here; pulling all parent
      // columns (and any eager relations) on every sub-resource request
      // would be wasteful. `select` narrows the read to the primary key
      // — but only when no parent hook is replayed, because an
      // `afterFindOne` hook that inspects a non-selected column (an
      // expiry timestamp, a status) would otherwise decide on `undefined`.
      ...(this.parentHooks.length ? {} : { select: [this.parentPk] }),
      ctx: this.parentReadContext(actorId),
    });
    if (!parent) {
      throw new NotFoundException(
        `${this.parentEntityKey} ${parentId} not found`,
      );
    }

    return true;
  }

  /**
   * Static factory binding the parent param name, parent entity key, the
   * parent's owner column, the parent's primary-key column, and the
   * parent's hooks on a cached named subclass. Subclass cache keyed by
   * `(parentParam, parentEntityKey, ownerColumn, parentPk, parentHooks)`
   * so distinct bindings receive distinct provider tokens.
   */
  static for(
    parentParam: string,
    parentEntityKey: string,
    ownerColumn: string,
    parentPk: string = 'id',
    parentHooks: readonly Type[] = [],
  ): Type<PathScopeGuard> {
    return getPathScopeGuardSubclass(
      parentParam,
      parentEntityKey,
      ownerColumn,
      parentPk,
      parentHooks,
    );
  }

  /**
   * Detached per-call context carrying the parent's hooks and the actor.
   * Returns `undefined` when the parent declares no hooks so the
   * hook-free path keeps its previous (context-less) behaviour.
   */
  private parentReadContext(actorId: string): AppContextHost | undefined {
    if (!this.parentHooks.length) return undefined;

    const ctx = new AppContextHost();
    ctx.defineOverlay(HooksCtx, {
      hooks: this.parentHooks.map((hook) => ({ hook, type: RepoHook.KEY })),
    });
    ctx.defineOverlay(ActorCtx, { id: actorId, type: 'user' });
    return ctx;
  }
}

const pathScopeGuardCache = new Map<string, Type<PathScopeGuard>>();

function getPathScopeGuardSubclass(
  parentParam: string,
  parentEntityKey: string,
  ownerColumn: string,
  parentPk: string,
  parentHooks: readonly Type[],
): Type<PathScopeGuard> {
  // JSON.stringify over the tuple, not a `::`-joined string: delimiter
  // joining collides whenever a component can contain the delimiter, and
  // nothing validates that these four never do. Hook classes are keyed
  // by their registered ids so two resources sharing a param/key/column
  // triple but different hooks still get distinct provider tokens.
  const cacheKey = JSON.stringify([
    parentParam,
    parentEntityKey,
    ownerColumn,
    parentPk,
    parentHooks.map(hookCacheId),
  ]);
  const existing = pathScopeGuardCache.get(cacheKey);
  if (existing) return existing;

  const className = `PathScopeGuard_${parentParam}_${parentEntityKey}_${ownerColumn}`;
  const Subclass: Type<PathScopeGuard> = class extends PathScopeGuard {
    constructor(parentRepo: RepositoryInterface<Record<string, unknown>>) {
      super();
      this.parentParam = parentParam;
      this.parentEntityKey = parentEntityKey;
      this.ownerColumn = ownerColumn;
      this.parentPk = parentPk;
      this.parentHooks = parentHooks;
      this.parentRepo = parentRepo;
    }
  };
  Object.defineProperty(Subclass, 'name', { value: className });

  const inject: ParameterDecorator = InjectDynamicRepository(parentEntityKey);
  inject(Subclass, undefined, 0);
  Injectable()(Subclass);

  const ctor = Subclass;

  pathScopeGuardCache.set(cacheKey, ctor);
  return ctor;
}

// Hook classes are objects, so they cannot go through `JSON.stringify`
// directly and their `.name` is not unique (two `for()` factories can
// mint identically-named subclasses). Assign a stable per-class id the
// first time a class is seen.
const hookCacheIds = new WeakMap<Type, number>();
let nextHookCacheId = 0;

function hookCacheId(hook: Type): number {
  const existing = hookCacheIds.get(hook);
  if (existing !== undefined) return existing;
  const id = nextHookCacheId++;
  hookCacheIds.set(hook, id);
  return id;
}
