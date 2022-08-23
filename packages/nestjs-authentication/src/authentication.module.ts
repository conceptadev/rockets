import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';

import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@concepta/nestjs-core';
import {
  JwtIssueService,
  JwtModule,
  JwtVerifyService,
} from '@concepta/nestjs-jwt';

import {
  AUTHENTICATION_MODULE_OPTIONS_TOKEN,
  AUTHENTICATION_MODULE_SETTINGS_TOKEN,
  AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN,
} from './authentication.constants';

import { AuthenticationOptionsInterface } from './interfaces/authentication-options.interface';
import { ValidateTokenServiceInterface } from './interfaces/validate-token-service.interface';
import { IssueTokenService } from './services/issue-token.service';
import { VerifyTokenService } from './services/verify-token.service';

import { authenticationDefaultConfig } from './config/authentication-default.config';

@Module({
  providers: [JwtIssueService, JwtVerifyService],
  exports: [
    IssueTokenService,
    VerifyTokenService,
    JwtIssueService,
    JwtVerifyService,
  ],
})
export class AuthenticationModule extends createConfigurableDynamicRootModule<
  AuthenticationModule,
  AuthenticationOptionsInterface
>(AUTHENTICATION_MODULE_OPTIONS_TOKEN, {
  imports: [ConfigModule.forFeature(authenticationDefaultConfig), JwtModule],
  providers: [
    {
      provide: AUTHENTICATION_MODULE_SETTINGS_TOKEN,
      inject: [
        AUTHENTICATION_MODULE_OPTIONS_TOKEN,
        authenticationDefaultConfig.KEY,
      ],
      useFactory: async (
        options: AuthenticationOptionsInterface,
        defaultSettings: ConfigType<typeof authenticationDefaultConfig>,
      ) => options.settings ?? defaultSettings,
    },
    {
      provide: IssueTokenService,
      inject: [AUTHENTICATION_MODULE_OPTIONS_TOKEN, JwtIssueService],
      useFactory: async (
        options: AuthenticationOptionsInterface,
        jwtIssueService: JwtIssueService,
      ) => options.issueTokenService ?? new IssueTokenService(jwtIssueService),
    },
    {
      provide: VerifyTokenService,
      inject: [
        AUTHENTICATION_MODULE_OPTIONS_TOKEN,
        JwtVerifyService,
        AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN,
      ],
      useFactory: async (
        options: AuthenticationOptionsInterface,
        jwtVerifyService: JwtVerifyService,
        validateTokenService: ValidateTokenServiceInterface,
      ) =>
        options.verifyTokenService ??
        new VerifyTokenService(jwtVerifyService, validateTokenService),
    },
    {
      provide: AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN,
      inject: [AUTHENTICATION_MODULE_OPTIONS_TOKEN],
      useFactory: async (options: AuthenticationOptionsInterface) =>
        options.validateTokenService,
    },
  ],
}) {
  static register(options: AuthenticationOptionsInterface = {}) {
    return AuthenticationModule.forRoot(AuthenticationModule, options);
  }

  static registerAsync(
    options: AsyncModuleConfig<AuthenticationOptionsInterface>,
  ) {
    return AuthenticationModule.forRootAsync(AuthenticationModule, {
      useFactory: () => ({}),
      ...options,
    });
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<AuthenticationModule, AuthenticationOptionsInterface>(
      AuthenticationModule,
      options,
    );
  }
}
