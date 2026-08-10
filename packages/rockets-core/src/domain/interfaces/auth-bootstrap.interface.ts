import type { DynamicModule, Type } from '@nestjs/common';
import type { RepositoryModuleInterface } from '@concepta/nestjs-repository';
import type { AuthAdapterInterface } from './auth-adapter.interface';
import type { RepositoryBootstrap } from './repository-bootstrap.interface';
import type { RocketsUserMetadataConfig } from './rockets-user-metadata-config.interface';
import type { ResourceInput } from '../../infrastructure/resource/planner/app-registration-plan.types';

/**
 * Identity ownership an auth integration claims over the surrounding app:
 * the persistence rows, root repository, and user-metadata contract for the
 * single user space every adapter in the chain authenticates into. At most
 * ONE bootstrap per app may carry this — the server rejects two owners at
 * composition time. Explicit options on `RocketsModule` still win.
 *
 * Resolved by `@concepta/rockets` (`createServer` / `RocketsModule`);
 * `RocketsCoreModule` does not read it.
 */
export interface AuthBootstrapIdentity {
  readonly resources?: ReadonlyArray<ResourceInput>;
  readonly userMetadata?: RocketsUserMetadataConfig;
  readonly repository?: RepositoryModuleInterface | RepositoryBootstrap;
}

/**
 * Per-integration guard preferences. Unlike {@link AuthBootstrapIdentity},
 * these can coexist across an auth chain; conflicting values fail at
 * composition. Explicit options on `RocketsModule` take precedence.
 *
 * Resolved by `@concepta/rockets` (`createServer` / `RocketsModule`);
 * `RocketsCoreModule` does not read them.
 */
export interface AuthBootstrapContributions {
  /**
   * Contribute `false` only together with `providesAppGuard: true` — an
   * integration may swap the global guard, never remove it. Removing the
   * guard entirely is an app-level decision (`enableGlobalGuard: false` on
   * the module options).
   */
  readonly enableGlobalGuard?: boolean;
  /**
   * Declares that this integration registers its own app-wide guard
   * (`APP_GUARD`), so contributing `enableGlobalGuard: false` is a guard
   * swap rather than leaving the app unguarded.
   */
  readonly providesAppGuard?: boolean;
}

/**
 * Light / external auth wiring. When `forRoot` is set, core imports the
 * returned module after swagger (repos must exist via `forFeature` first).
 */
export interface AuthBootstrap<
  Adapter extends AuthAdapterInterface = AuthAdapterInterface,
> {
  readonly adapter: Type<Adapter>;
  readonly forRoot?: () => DynamicModule;
  /** Singular identity ownership — at most one bootstrap per app. */
  readonly identity?: AuthBootstrapIdentity;
  /** Guard preferences owned by this integration; explicit app options win. */
  readonly contributes?: AuthBootstrapContributions;
}
