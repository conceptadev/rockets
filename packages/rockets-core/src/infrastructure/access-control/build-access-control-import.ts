import { DynamicModule, type Provider, type Type } from '@nestjs/common';
import {
  AccessControlModule,
  type CanAccess,
} from '@concepta/nestjs-access-control';
import { RocketsAccessControlConfig } from '../config/interfaces/rockets-core-options-extras.interface';

/**
 * Builds the `AccessControlModule.forRoot` import from a
 * {@link RocketsAccessControlConfig}. Shared by `RocketsCoreModule` and
 * `rockets-server-auth` so both wire access control identically.
 *
 * The whole config is forwarded (settings, service, appFilter, `ports`,
 * imports, queryServices). `appGuard` in particular is passed AS-IS with no
 * defaulting: upstream treats `false` as "no global guard" and any nullish
 * value as "use the default `AccessControlGuard` instance from DI as
 * APP_GUARD". This is load-bearing because
 * `AccessControlGuard.getQueryService` uses a STRICT `moduleRef.resolve()`
 * that only sees providers on the SAME module the guard instance lives in.
 * As APP_GUARD its host module is `AccessControlModule` — the same module
 * that receives `queryServices` — so the strict resolve succeeds. Guarding a
 * controller with `@UseGuards(AccessControlGuard)` instead would instantiate
 * the guard in the controller's module scope, where queryServices are NOT
 * registered, and every request would 500 with `UnknownElementException`.
 */
/** Injection token a provider registers under. */
function providerToken(provider: Provider<CanAccess>): unknown {
  return typeof provider === 'function' ? provider : provider.provide;
}

export function buildAccessControlImport(
  config: RocketsAccessControlConfig,
  collectedQueryServices: ReadonlyArray<Type<CanAccess>> = [],
): DynamicModule {
  // `enforceGrants` is a Rockets planner flag, not an upstream option —
  // forwarding it would land an unknown key in the upstream config.
  const { enforceGrants: _enforceGrants, ...upstream } = config;

  const declared = upstream.queryServices ?? [];
  // Compared by TOKEN, not by provider object. An app registering
  // `{ provide: OwnerCanAccess, useClass: TestOwnerCanAccess }` would not
  // match the bare class, so appending it would shadow that deliberate
  // `useClass` — in Nest the last provider for a token wins.
  const declaredTokens = new Set(declared.map(providerToken));
  const merged = [
    ...declared,
    ...collectedQueryServices.filter((service) => !declaredTokens.has(service)),
  ];

  return AccessControlModule.forRoot({
    ...upstream,
    ...(merged.length ? { queryServices: merged } : {}),
  });
}
