import { ExecutionContext, Inject, Injectable, Optional } from '@nestjs/common';
import {
  ContextOverlayInterceptor,
  getAppContext,
  OverlayRef,
} from '@concepta/nestjs-core';
import type { Actor } from '../../domain/interfaces/actor.interface';
import type { AuthorizedUser } from '../../domain/interfaces/auth-user.interface';
import type { RocketsActorOptions } from '../config/interfaces/rockets-actor-options.interface';

export const ActorCtx = new OverlayRef<'withActor', Actor>('withActor');

/** Carries `RocketsActorOptions.metadata`; registered only when the app sets it. */
export const ROCKETS_ACTOR_METADATA_TOKEN = Symbol('ROCKETS_ACTOR_METADATA');

/**
 * The actor for an authenticated user, built one way wherever it is needed:
 * `ActorOverlay` below, and `PathScopeGuard`, which runs before interceptors
 * and so cannot read the overlay.
 */
export function buildUserActor(
  user: AuthorizedUser,
  resolveMetadata: RocketsActorOptions['metadata'],
): Actor {
  const metadata = resolveMetadata?.(user);
  return metadata === undefined
    ? { id: user.id, type: 'user' }
    : { id: user.id, type: 'user', metadata };
}

/**
 * Attaches an `Actor` overlay to the per-request `AppContextHost`, reading
 * the authenticated user that `AuthServerGuard` placed on `request.user`.
 *
 * The point of this overlay (vs. consumers reading `httpRequest.user`
 * directly) is that hooks running under a CRUD context get the actor via
 * `ctx.with(ActorCtx)` whether the trigger was an HTTP request, an
 * in-process background job, or a CLI command — provided the entry point
 * defines the overlay. For HTTP, this interceptor handles it automatically.
 *
 * The actor carries only the user id unless the app sets
 * `actor.metadata` in the module options, which copies the data it returns
 * (tenant ids from token claims, typically) into `Actor.metadata`.
 */
@Injectable()
export class ActorOverlay extends ContextOverlayInterceptor {
  readonly ref = ActorCtx;

  constructor(
    @Optional()
    @Inject(ROCKETS_ACTOR_METADATA_TOKEN)
    private readonly resolveMetadata?: RocketsActorOptions['metadata'],
  ) {
    super();
  }

  attach(context: ExecutionContext): void {
    const req = context.switchToHttp().getRequest<{ user?: AuthorizedUser }>();
    const user = req?.user;
    if (!user?.id) return;

    const actor = buildUserActor(user, this.resolveMetadata);
    getAppContext(req).defineOverlay(this.ref, actor);
  }
}
