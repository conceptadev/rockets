import type { DynamicModule, Provider, Type } from '@nestjs/common';

import type { AuthAdapterInterface } from '../../domain/interfaces/auth-adapter.interface';
import type {
  AuthBootstrap,
  AuthBootstrapContributions,
  AuthBootstrapIdentity,
} from '../../domain/interfaces/auth-bootstrap.interface';

/**
 * Optional Nest wiring and server defaults owned by a custom auth adapter.
 *
 * `identity` and `contributes` are for integration PACKAGES that own user
 * persistence or guard behavior. App code should set `userMetadata`,
 * `repository`, and `resources` on the module options instead.
 */
export interface DefineAuthAdapterOptions {
  readonly imports?: NonNullable<DynamicModule['imports']>;
  readonly controllers?: NonNullable<DynamicModule['controllers']>;
  readonly providers?: ReadonlyArray<Provider>;
  readonly exports?: NonNullable<DynamicModule['exports']>;
  readonly identity?: AuthBootstrapIdentity;
  readonly contributes?: AuthBootstrapContributions;
}

/**
 * Turn a custom adapter into a complete auth integration.
 *
 * The generated host module registers and exports the adapter so Rockets can
 * inject it into the ordered guard chain. Additional Nest wiring remains
 * private to that integration unless explicitly exported.
 */
export function defineAuthAdapter<Adapter extends AuthAdapterInterface>(
  adapter: Type<Adapter>,
  options: DefineAuthAdapterOptions = {},
): AuthBootstrap<Adapter> {
  return {
    adapter,
    identity: options.identity,
    contributes: options.contributes,
    forRoot: () => ({
      module: class AuthAdapterHostModule {},
      imports: [...(options.imports ?? [])],
      controllers: [...(options.controllers ?? [])],
      providers: [...(options.providers ?? []), adapter],
      exports: [adapter, ...(options.exports ?? [])],
    }),
  };
}
