import {
  DynamicModule,
  Module,
  ModuleMetadata,
  Provider,
  Type,
  ValueProvider,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import {
  FIREBASE_AUTH_MODULE_OPTIONS_TOKEN,
  FIREBASE_SESSION_COOKIE_VERIFIER_TOKEN,
  FIREBASE_TOKEN_VERIFIER_TOKEN,
  FIREBASE_USER_RESOLVER_TOKEN,
} from '../constants/firebase-auth.constants';
import { FirebaseAuthAdapter } from '../adapters/firebase-auth.adapter';
import { FirebaseSessionCookieAdapter } from '../adapters/firebase-session-cookie.adapter';
import {
  FirebaseAuthModuleAsyncOptions,
  FirebaseAuthModuleOptionsFactory,
} from '../interfaces/firebase-auth-async-options.interface';
import { FirebaseAuthModuleOptions } from '../interfaces/firebase-auth-options.interface';
import { FirebaseTokenVerifierInterface } from '../interfaces/firebase-token-verifier.interface';
import { FirebaseUserResolverInterface } from '../interfaces/firebase-user-resolver.interface';
import { DefaultFirebaseUserResolverService } from '../services/default-firebase-user-resolver.service';
import { FirebaseTokenVerifierService } from '../services/firebase-token-verifier.service';

@Module({})
export class FirebaseAuthModule {
  /**
   * Wire the adapter at the application root. Returns a `global: true`
   * dynamic module so `FirebaseAuthAdapter` is injectable from any
   * other module (notably the root composition where `RocketsModule`
   * includes it in the `AUTH_ADAPTERS_TOKEN` chain). Without `global`,
   * downstream modules can't resolve the adapter unless they also
   * import this module — which leaks Firebase wiring across the app
   * and defeats the point of the abstraction.
   */
  static forRoot(options: FirebaseAuthModuleOptions): DynamicModule {
    validateOptions(options);

    return this.buildDynamicModule(
      [
        optionsProvider(options),
        verifierProvider(),
        sessionVerifierAliasProvider(),
        userResolverProvider(),
      ],
      options.imports ?? [],
    );
  }

  static forRootAsync(options: FirebaseAuthModuleAsyncOptions): DynamicModule {
    return this.buildDynamicModule(
      [
        ...asyncOptionsProviders(options),
        verifierProvider(),
        sessionVerifierAliasProvider(),
        userResolverProvider(),
      ],
      options.imports ?? [],
    );
  }

  private static buildDynamicModule(
    providers: Provider[],
    imports: ModuleMetadata['imports'],
  ): DynamicModule {
    return {
      module: FirebaseAuthModule,
      global: true,
      imports,
      // FirebaseSessionCookieAdapter is ALWAYS registered, same as
      // FirebaseAuthAdapter — being injectable is not the same as being
      // IN an app's auth chain. An app opts in by adding it to its own
      // `RocketsModule.forRoot({ auth: [...] })` array; a bearer-only
      // app that never does gets no behavior change (issue #58).
      providers: [
        ...providers,
        FirebaseAuthAdapter,
        FirebaseSessionCookieAdapter,
      ],
      exports: [FirebaseAuthAdapter, FirebaseSessionCookieAdapter],
    };
  }
}

function validateOptions(options: FirebaseAuthModuleOptions): void {
  if (!options.verifier && !options.firebaseApp) {
    throw new Error(
      'FirebaseAuthModule: provide either `firebaseApp` (an initialized ' +
        'firebase-admin app) or a custom `verifier` class.',
    );
  }
}

function optionsProvider(
  options: FirebaseAuthModuleOptions,
): ValueProvider<FirebaseAuthModuleOptions> {
  return {
    provide: FIREBASE_AUTH_MODULE_OPTIONS_TOKEN,
    useValue: options,
  };
}

function asyncOptionsProvider(
  options: FirebaseAuthModuleAsyncOptions,
): Provider {
  const useFactory = options.useFactory;
  if (useFactory) {
    return {
      provide: FIREBASE_AUTH_MODULE_OPTIONS_TOKEN,
      useFactory: async (
        ...args: readonly unknown[]
      ): Promise<FirebaseAuthModuleOptions> => {
        const resolved = await useFactory(...args);
        validateOptions(resolved);
        return resolved;
      },
      inject: options.inject ?? [],
    };
  }

  if (options.useExisting) {
    return {
      provide: FIREBASE_AUTH_MODULE_OPTIONS_TOKEN,
      useFactory: async (
        factory: FirebaseAuthModuleOptionsFactory,
      ): Promise<FirebaseAuthModuleOptions> => {
        const resolved = await factory.createFirebaseAuthModuleOptions();
        validateOptions(resolved);
        return resolved;
      },
      inject: [options.useExisting],
    };
  }

  if (options.useClass) {
    return {
      provide: FIREBASE_AUTH_MODULE_OPTIONS_TOKEN,
      useFactory: async (
        factory: FirebaseAuthModuleOptionsFactory,
      ): Promise<FirebaseAuthModuleOptions> => {
        const resolved = await factory.createFirebaseAuthModuleOptions();
        validateOptions(resolved);
        return resolved;
      },
      inject: [options.useClass],
    };
  }

  throw new Error(
    'FirebaseAuthModule.forRootAsync: provide `useFactory`, `useExisting`, or `useClass`.',
  );
}

function asyncOptionsProviders(
  options: FirebaseAuthModuleAsyncOptions,
): Provider[] {
  if (options.useClass) {
    return [
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
      asyncOptionsProvider(options),
    ];
  }

  return [asyncOptionsProvider(options)];
}

function verifierProvider(): Provider {
  return {
    provide: FIREBASE_TOKEN_VERIFIER_TOKEN,
    useFactory: async (
      moduleRef: ModuleRef,
      options: FirebaseAuthModuleOptions,
    ): Promise<FirebaseTokenVerifierInterface> => {
      if (options.verifier) {
        return moduleRef.create(options.verifier);
      }

      return new FirebaseTokenVerifierService(options.firebaseApp);
    },
    inject: [ModuleRef, FIREBASE_AUTH_MODULE_OPTIONS_TOKEN],
  };
}

/**
 * `FirebaseSessionCookieAdapter` injects the verifier under this token
 * purely for a narrower type — `useExisting` resolves the SAME instance
 * `FIREBASE_TOKEN_VERIFIER_TOKEN` does, not a second one. If a custom
 * `verifier` class is configured and does not ALSO implement
 * `FirebaseSessionCookieVerifierInterface`, that only surfaces as a
 * runtime error if the app both configures a custom verifier AND adds
 * `FirebaseSessionCookieAdapter` to its own auth chain — the default
 * `FirebaseTokenVerifierService` always implements both.
 */
function sessionVerifierAliasProvider(): Provider {
  return {
    provide: FIREBASE_SESSION_COOKIE_VERIFIER_TOKEN,
    useExisting: FIREBASE_TOKEN_VERIFIER_TOKEN,
  };
}

function userResolverProvider(): Provider {
  return {
    provide: FIREBASE_USER_RESOLVER_TOKEN,
    useFactory: async (
      moduleRef: ModuleRef,
      options: FirebaseAuthModuleOptions,
    ): Promise<FirebaseUserResolverInterface> => {
      const useClass: Type<FirebaseUserResolverInterface> =
        options.userResolver ?? DefaultFirebaseUserResolverService;
      return moduleRef.create(useClass);
    },
    inject: [ModuleRef, FIREBASE_AUTH_MODULE_OPTIONS_TOKEN],
  };
}
