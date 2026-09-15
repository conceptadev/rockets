import type { AuthorizedUser } from '../../../domain/interfaces/auth-user.interface';

/**
 * How the authenticated user becomes the request's `Actor`.
 */
export interface RocketsActorOptions {
  /**
   * Copies data from the authenticated user into `Actor.metadata`, so code
   * that only sees the actor — a `TenantScopeHook` resolver, a stamp hook,
   * audit — can read it. Typical use is tenant ids carried as token claims:
   * `(user) => ({ dealerIds: user.claims?.dealers })`.
   *
   * Runs on every authenticated request, and a second time on a
   * sub-resource route whose parent has hooks (once for the parent lookup,
   * once for the route) — keep it a cheap, pure mapping. `Actor` stays
   * transport-agnostic, so nothing from the user reaches it unless it is
   * returned here; returning `undefined` leaves `metadata` unset.
   */
  readonly metadata?: (
    user: AuthorizedUser,
  ) => Readonly<Record<string, unknown>> | undefined;
}
