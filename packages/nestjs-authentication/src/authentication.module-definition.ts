import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationCombinedOptionsInterface } from './core/interfaces/authentication-combined-options.interface';
import { AuthenticationOptionsExtrasInterface } from './core/interfaces/authentication-options-extras.interface';
import { authenticationOptionsDefaultConfig } from './config/authentication-options-default.config';
import { JwtOptionsInterface } from './jwt/interfaces/jwt-options.interface';
import { AuthenticationCoreModule } from './authentication-core.module';
import { JwtModule } from './jwt';
import { AuthJwtModule } from './auth-jwt';
import { AuthRefreshModule } from './refresh';
import { AuthJwtOptionsInterface } from './auth-jwt/interfaces/auth-jwt-options.interface';
import { AuthRefreshOptionsInterface } from './refresh/interfaces/auth-refresh-options.interface';

const AUTHENTICATION_MODULE_RAW_OPTIONS_TOKEN = Symbol('__AUTHENTICATION_MODULE_RAW_OPTIONS_TOKEN__');

export const {
  ConfigurableModuleClass: AuthenticationModuleClass,
  OPTIONS_TYPE: AUTHENTICATION_MODULE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: AUTHENTICATION_MODULE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthenticationCombinedOptionsInterface>({
  moduleName: 'AuthenticationCombined',
  optionsInjectionToken: AUTHENTICATION_MODULE_RAW_OPTIONS_TOKEN,
})
  .setExtras<AuthenticationOptionsExtrasInterface>(
    { global: false },
    definitionTransform,
  )
  .build();

export type AuthenticationCombinedOptions = Omit<
  typeof AUTHENTICATION_MODULE_OPTIONS_TYPE,
  'global'
>;

export type AuthenticationCombinedAsyncOptions = Omit<
  typeof AUTHENTICATION_MODULE_ASYNC_OPTIONS_TYPE,
  'global'
>;

/**
 * Transform the definition to include the combined modules
 */
function definitionTransform(
  definition: DynamicModule,
  extras: AuthenticationOptionsExtrasInterface,
): DynamicModule {
  const { imports = [], providers = [], exports = [] } = definition;

  
  return {
    ...definition,
    global: extras.global,
    imports: createAuthenticationOptionsImports({ imports }),
    providers: createAuthenticationOptionsProviders({ providers }),
    exports: createAuthenticationOptionsExports({ exports }),
  };
}

/**
 * Create imports for the combined module
 */
export function createAuthenticationOptionsImports(options: {
  imports: DynamicModule['imports']
}): DynamicModule['imports'] {
  return [
    ...options.imports || [],
    ConfigModule.forFeature(authenticationOptionsDefaultConfig),
    AuthenticationCoreModule.forRootAsync({
      inject: [AUTHENTICATION_MODULE_RAW_OPTIONS_TOKEN],
      useFactory: (options: AuthenticationCombinedOptionsInterface) => {
        return {
          verifyTokenService: options.authentication?.verifyTokenService || options.services?.verifyTokenService,
          issueTokenService: options.authentication?.issueTokenService || options.services?.issueTokenService,
          validateTokenService: options.authentication?.validateTokenService || options.services?.validateTokenService,
          settings: options.authentication?.settings,
        };
      }
    }),
    JwtModule.forRootAsync({
      inject: [AUTHENTICATION_MODULE_RAW_OPTIONS_TOKEN],
      useFactory: (options: AuthenticationCombinedOptionsInterface): JwtOptionsInterface => {
        return {
          jwtIssueTokenService: options.jwt?.jwtIssueTokenService || options.services?.jwtIssueTokenService,
          jwtRefreshService: options.jwt?.jwtRefreshService || options.services?.jwtRefreshService,
          jwtVerifyTokenService: options.jwt?.jwtVerifyTokenService || options.services?.jwtVerifyTokenService,
          jwtAccessService: options.jwt?.jwtAccessService || options.services?.jwtAccessService,
          jwtService: options.jwt?.jwtService || options.services?.jwtService,
          settings: options.jwt?.settings,
        };
      }
    }),
    AuthJwtModule.forRootAsync({
      inject: [AUTHENTICATION_MODULE_RAW_OPTIONS_TOKEN],
      useFactory: (options: AuthenticationCombinedOptionsInterface): AuthJwtOptionsInterface => {
        return {
          appGuard: options.authJwt?.appGuard,
          verifyTokenService: options.authJwt?.verifyTokenService || options.services?.verifyTokenService,
          userLookupService:
            options.authJwt?.userLookupService ||
            options.services?.userLookupService,
          settings: options.authJwt?.settings,
        };
      }
    }),
    AuthRefreshModule.forRootAsync({
      inject: [AUTHENTICATION_MODULE_RAW_OPTIONS_TOKEN],
      useFactory: (options: AuthenticationCombinedOptionsInterface): AuthRefreshOptionsInterface => {
        return {
          verifyTokenService: options.refresh?.verifyTokenService || options.services?.verifyTokenService,
          issueTokenService: options.refresh?.issueTokenService || options.services?.issueTokenService,
          userLookupService: options.refresh?.userLookupService || options.services?.userLookupService,
          settings: options.refresh?.settings,
        };
      }
    }),
  ];
}

/**
 * Create exports for the combined module
 */
export function createAuthenticationOptionsExports(options: {
  exports: DynamicModule['exports']
}): DynamicModule['exports'] {
  
  return [
    ...(options.exports || [] ),
    ConfigModule,
    AUTHENTICATION_MODULE_RAW_OPTIONS_TOKEN,
    JwtModule,
    AuthJwtModule,
    AuthRefreshModule,
  ];
}

/**
 * Create providers for the combined module
 */
export function createAuthenticationOptionsProviders(options: {
  providers?: Provider[];
}): Provider[] {
  return [
    ...(options.providers ?? []),
  ];
} 