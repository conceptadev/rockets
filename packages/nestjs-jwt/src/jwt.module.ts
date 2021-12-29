import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule as NestJwtModule, JwtService } from '@nestjs/jwt';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
} from '@rockts-org/nestjs-common';
import { defaultServiceConfig } from './config/default-service.config';
import { JwtOptionsInterface } from './interfaces/jwt-options.interface';
import {
  JWT_MODULE_JWT_SERVICE_TOKEN,
  JWT_MODULE_OPTIONS_TOKEN,
} from './jwt.constants';

import { IssueTokenService } from './services/issue-token.service';

@Module({
  providers: [IssueTokenService],
  exports: [IssueTokenService],
})
export class JwtModule extends createConfigurableDynamicRootModule<
  JwtModule,
  JwtOptionsInterface
>(JWT_MODULE_OPTIONS_TOKEN, {
  imports: [
    NestJwtModule.registerAsync({
      imports: [ConfigModule.forFeature(defaultServiceConfig)],
      inject: [defaultServiceConfig.KEY],
      useFactory: async (config: ConfigType<typeof defaultServiceConfig>) =>
        config,
    }),
  ],
  providers: [
    {
      provide: JWT_MODULE_JWT_SERVICE_TOKEN,
      inject: [JWT_MODULE_OPTIONS_TOKEN, JwtService],
      useFactory: async (
        options: JwtOptionsInterface,
        defaultService: JwtService,
      ) => options.jwtService ?? defaultService,
    },
  ],
  exports: [JWT_MODULE_JWT_SERVICE_TOKEN],
}) {
  static register(options: JwtOptionsInterface = {}) {
    return JwtModule.forRoot(JwtModule, options);
  }
  static registerAsync(options: AsyncModuleConfig<JwtOptionsInterface>) {
    return JwtModule.forRootAsync(JwtModule, options);
  }
}
