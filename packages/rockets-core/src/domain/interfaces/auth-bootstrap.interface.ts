import type { DynamicModule, Type } from '@nestjs/common';
import type { RepositoryModuleInterface } from '@concepta/nestjs-repository';
import type { AuthAdapterInterface } from './auth-adapter.interface';
import type { RepositoryBootstrap } from './repository-bootstrap.interface';
import type { RocketsUserMetadataConfig } from './rockets-user-metadata-config.interface';
import type { ResourceInput } from '../../infrastructure/resource/planner/app-registration-plan.types';

/**
 * Defaults an auth integration can contribute to the surrounding Rockets app.
 * Explicit options on `RocketsModule` take precedence over every contribution.
 */
export interface AuthBootstrapContributions {
  readonly resources?: ReadonlyArray<ResourceInput>;
  readonly userMetadata?: RocketsUserMetadataConfig;
  readonly repository?: RepositoryModuleInterface | RepositoryBootstrap;
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
  /** Persistence and server defaults owned by this integration. */
  readonly contributes?: AuthBootstrapContributions;
}
