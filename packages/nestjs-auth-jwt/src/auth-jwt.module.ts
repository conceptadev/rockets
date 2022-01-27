import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@rockts-org/nestjs-common';

import {
  AUTH_JWT_MODULE_OPTIONS_TOKEN,
  AUTH_JWT_MODULE_SETTINGS_TOKEN,
} from './auth-jwt.constants';
import { authJwtDefaultConfig } from './config/auth-jwt-default.config';

import { AuthJwtOptionsInterface } from './interfaces/auth-jwt-options.interface';
import { AuthJwtStrategy } from './auth-jwt.strategy';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';

/**
 * Auth local module
 */
@Module({
  providers: [AuthJwtStrategy],
  exports: [AuthJwtStrategy],
  controllers: [],
})
export class AuthJwtModule extends createConfigurableDynamicRootModule<
  AuthJwtModule,
  AuthJwtOptionsInterface
>(AUTH_JWT_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(authJwtDefaultConfig),
    AuthenticationModule.deferred({
      timeoutMessage:
        'AuthJwtModule requires AuthenticationModule to be registered in your application.',
    }),
  ],
  providers: [
    //TODO: remove this? settings should come from jwt module
    {
      provide: AUTH_JWT_MODULE_SETTINGS_TOKEN,
      inject: [AUTH_JWT_MODULE_OPTIONS_TOKEN, authJwtDefaultConfig.KEY],
      useFactory: async (
        options: AuthJwtOptionsInterface,
        defaultSettings: ConfigType<typeof authJwtDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
  ],
  exports: [],
}) {
  static register(options: AuthJwtOptionsInterface = {}) {
    const module = AuthJwtModule.forRoot(AuthJwtModule, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<AuthJwtOptionsInterface> = {},
  ) {
    const module = AuthJwtModule.forRootAsync(AuthJwtModule, {
      useFactory: () => ({}),
      ...options,
    });

    return module;
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<AuthJwtModule, AuthJwtOptionsInterface>(
      AuthJwtModule,
      options,
    );
  }
}
