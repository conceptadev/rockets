import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule as NestJwtModule, JwtService } from '@nestjs/jwt';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@concepta/nestjs-common';
import { JwtOptionsInterface } from './interfaces/jwt-options.interface';
import {
  JWT_MODULE_JWT_SERVICE_ACCESS_TOKEN,
  JWT_MODULE_JWT_SERVICE_REFRESH_TOKEN,
  JWT_MODULE_OPTIONS_TOKEN,
  JWT_MODULE_SETTINGS_TOKEN,
} from './jwt.constants';

import { jwtDefaultConfig } from './config/jwt-default.config';

import { DefaultJwtIssueService } from './services/default-jwt-issue.service';
import { DefaultJwtSignService } from './services/default-jwt-sign.service';

import { JwtIssueService } from './services/jwt-issue.service';
import { JwtSignService } from './services/jwt-sign.service';
import { JwtVerifyService } from './services/jwt-verify.service';
import { DefaultJwtVerifyService } from './services/default-jwt-verify.service';
import { JwtSettingsInterface } from './interfaces/jwt-settings.interface';

@Module({
  providers: [
    DefaultJwtSignService,
    DefaultJwtIssueService,
    DefaultJwtVerifyService,
  ],
  exports: [JwtSignService, JwtIssueService, JwtVerifyService],
})
export class JwtModule extends createConfigurableDynamicRootModule<
  JwtModule,
  JwtOptionsInterface
>(JWT_MODULE_OPTIONS_TOKEN, {
  imports: [
    ConfigModule.forFeature(jwtDefaultConfig),
    NestJwtModule.register({}),
  ],
  providers: [
    {
      provide: JWT_MODULE_SETTINGS_TOKEN,
      inject: [JWT_MODULE_OPTIONS_TOKEN, jwtDefaultConfig.KEY],
      useFactory: async (
        options: JwtOptionsInterface,
        defaultSettings: ConfigType<typeof jwtDefaultConfig>,
      ) => options?.settings ?? defaultSettings,
    },
    {
      provide: JWT_MODULE_JWT_SERVICE_ACCESS_TOKEN,
      inject: [JWT_MODULE_SETTINGS_TOKEN],
      useFactory: async (options: JwtSettingsInterface) =>
        new JwtService(options.access),
    },
    {
      provide: JWT_MODULE_JWT_SERVICE_REFRESH_TOKEN,
      inject: [JWT_MODULE_SETTINGS_TOKEN],
      useFactory: async (options: JwtSettingsInterface) =>
        new JwtService(options.refresh),
    },
    {
      provide: JwtSignService,
      inject: [JWT_MODULE_OPTIONS_TOKEN, DefaultJwtSignService],
      useFactory: async (
        options: JwtOptionsInterface,
        defaultService: DefaultJwtSignService,
      ) => options.jwtSignService ?? defaultService,
    },
    {
      provide: JwtIssueService,
      inject: [JWT_MODULE_OPTIONS_TOKEN, DefaultJwtIssueService],
      useFactory: async (
        options: JwtOptionsInterface,
        defaultService: DefaultJwtIssueService,
      ) => options.jwtIssueService ?? defaultService,
    },
    {
      provide: JwtVerifyService,
      inject: [JWT_MODULE_OPTIONS_TOKEN, DefaultJwtVerifyService],
      useFactory: async (
        options: JwtOptionsInterface,
        defaultService: DefaultJwtVerifyService,
      ) => options.jwtVerifyService ?? defaultService,
    },
  ],
  exports: [
    JWT_MODULE_JWT_SERVICE_ACCESS_TOKEN,
    JWT_MODULE_JWT_SERVICE_REFRESH_TOKEN,
  ],
}) {
  static register(options: JwtOptionsInterface = {}) {
    return JwtModule.forRoot(JwtModule, options);
  }

  static registerAsync(options: AsyncModuleConfig<JwtOptionsInterface>) {
    return JwtModule.forRootAsync(JwtModule, {
      useFactory: () => ({}),
      ...options,
    });
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<JwtModule, JwtOptionsInterface>(JwtModule, options);
  }
}
