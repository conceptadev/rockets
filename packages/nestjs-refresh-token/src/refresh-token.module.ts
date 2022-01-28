import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@rockts-org/nestjs-common';

import {
  REFRESH_TOKEN_MODULE_OPTIONS_TOKEN,
  REFRESH_TOKEN_MODULE_SETTINGS_TOKEN,
  
} from './refresh-token.constants';
import { refreshTokenDefaultConfig } from './config/refresh-token-default.config';

import { RefreshTokenOptionsInterface } from './interfaces/refresh-token-options.interface';

import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { RefreshTokenServiceService } from '.';
import { DefaultRefreshTokenServiceService } from './services/default-refresh-token.service';
import { RefreshTokenController } from './refresh-token.controller';

/**
 * Auth local module
 */
@Module({
  controllers: [RefreshTokenController],
  providers: [RefreshTokenServiceService],
  exports: [RefreshTokenServiceService],
})
export class RefreshTokenModule extends createConfigurableDynamicRootModule<
  RefreshTokenModule,
  RefreshTokenOptionsInterface
>(REFRESH_TOKEN_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(refreshTokenDefaultConfig),
    AuthenticationModule.deferred({
      timeoutMessage:
        'RefreshTokenModule requires AuthenticationModule to be registered in your application.',
    }),
  ],
  providers: [
    //TODO: remove this? settings should come from jwt module
    {
      provide: REFRESH_TOKEN_MODULE_SETTINGS_TOKEN,
      inject: [REFRESH_TOKEN_MODULE_OPTIONS_TOKEN, refreshTokenDefaultConfig.KEY],
      useFactory: async (
        options: RefreshTokenOptionsInterface,
        defaultSettings: ConfigType<typeof refreshTokenDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: RefreshTokenServiceService,
      inject: [REFRESH_TOKEN_MODULE_OPTIONS_TOKEN, DefaultRefreshTokenServiceService],
      useFactory: async (
        options: RefreshTokenOptionsInterface,
        defaultService: DefaultRefreshTokenServiceService,
      ) => options.decodeTokenService ?? defaultService,
    },
  ],
  exports: [],
}) {
  static register(options: RefreshTokenOptionsInterface = {}) {
    const module = RefreshTokenModule.forRoot(RefreshTokenModule, options);

    return module;
  }

  static registerAsync(
    options: AsyncModuleConfig<RefreshTokenOptionsInterface> = {},
  ) {
    const module = RefreshTokenModule.forRootAsync(RefreshTokenModule, {
      useFactory: () => ({}),
      ...options,
    });

    return module;
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<RefreshTokenModule, RefreshTokenOptionsInterface>(
      RefreshTokenModule,
      options,
    );
  }
}
