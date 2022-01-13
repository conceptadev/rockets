import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule as NestJwtModule, JwtService } from '@nestjs/jwt';
import { IssueTokenServiceInterface } from '@rockts-org/nestjs-authentication';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@rockts-org/nestjs-common';
import { defaultSignServiceConfig } from './config/default-sign-service.config';
import { JwtOptionsInterface } from './interfaces/jwt-options.interface';
import { JwtSignServiceInterface } from './interfaces/jwt-sign-service.interface';
import {
  JWT_MODULE_JWT_SERVICE_TOKEN,
  JWT_MODULE_OPTIONS_TOKEN,
} from './jwt.constants';
import { DefaultJwtIssueService } from './services/default-jwt-issue.service';
import { DefaultJwtSignService } from './services/default-jwt-sign.service';

import { JwtIssueService } from './services/jwt-issue.service';
import { JwtSignService } from './services/jwt-sign.service';

@Module({
  providers: [DefaultJwtSignService, DefaultJwtIssueService],
  exports: [JwtSignService, JwtIssueService],
})
export class JwtModule extends createConfigurableDynamicRootModule<
  JwtModule,
  JwtOptionsInterface
>(JWT_MODULE_OPTIONS_TOKEN, {
  imports: [
    NestJwtModule.registerAsync({
      imports: [ConfigModule.forFeature(defaultSignServiceConfig)],
      inject: [defaultSignServiceConfig.KEY],
      useFactory: async (config: ConfigType<typeof defaultSignServiceConfig>) =>
        config,
    }),
  ],
  providers: [
    {
      provide: JWT_MODULE_JWT_SERVICE_TOKEN,
      useExisting: JwtService,
    },
    {
      provide: JwtSignService,
      inject: [JWT_MODULE_OPTIONS_TOKEN, DefaultJwtSignService],
      useFactory: async (
        options: JwtOptionsInterface,
        defaultService: JwtSignServiceInterface,
      ) => options.jwtSignService ?? defaultService,
    },
    {
      provide: JwtIssueService,
      inject: [JWT_MODULE_OPTIONS_TOKEN, DefaultJwtIssueService],
      useFactory: async (
        options: JwtOptionsInterface,
        defaultService: IssueTokenServiceInterface,
      ) => options.jwtIssueService ?? defaultService,
    },
  ],
  exports: [JWT_MODULE_JWT_SERVICE_TOKEN],
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
