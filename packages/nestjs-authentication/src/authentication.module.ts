import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@concepta/nestjs-common';
import {
  JwtIssueService,
  JwtModule,
  JwtVerifyService,
} from '@concepta/nestjs-jwt';
import { authenticationDefaultConfig } from './config/authentication-default.config';
import {
  AUTHENTICATION_MODULE_OPTIONS_TOKEN,
  AUTHENTICATION_MODULE_SETTINGS_TOKEN,
  AUTHENTICATION_MODULE_VALIDATE_TOKEN_SERVICE_TOKEN,
} from './authentication.constants';
import { AuthenticationOptionsInterface } from './interfaces/authentication-options.interface';
import { IssueTokenService } from './services/issue-token.service';
import { DefaultIssueTokenService } from './services/default-issue-token.service';
import { VerifyTokenService } from './services/verify-token.service';
import { DefaultVerifyTokenService } from './services/default-verify-token.service';

/**
 * Authentication Module to handle authentication and password encryption.
 * Its required to setup a service that implements CredentialLookupServiceInterface
 * to return the credentials information to be used for authentication
 *
 * ### Example
 * You can setup the module using forRootAsync as the following example.
 *
 * ```ts
 *
 * @Injectable()
 * class UserLookupService implements CredentialLookupServiceInterface {
 *
 *   constructor(
 *     private userService: userService) {
 *     super()
 *   }
 *   async getUser(username: string): Promise<CredentialLookupInterface> {
 *     return this.userService.getUser(username);
 *   }
 *
 *   async getAccessToken(username: string): Promise<AccessTokenInterface>{
 *     return this.userService.getAccessToken(username);
 *    }
 *
 *   async refreshToken(accessToken: string): Promise<AccessTokenInterface>{
 *     return null;
 *    }
 * }
 *
 *
 * imports: [
 *       TestModule,
 * AuthenticationModule.forRootAsync({
 *        imports: [TestModule, ConfigModule.forFeature(authenticationConfig)],
 *        credentialLookupProvider: UserLookupService,
 *        config: {
 *          inject: [authenticationConfig.KEY],
 *          useFactory: async (
 *            config: AuthenticationConfigOptionsInterface,
 *          ): Promise<AuthenticationConfigOptionsInterface> => {
 *            // overwrite config
 *            return {
 *              ...config,
 *              minPasswordStrength: PasswordStrengthEnum.VeryStrong,
 *            };
 *          },
 *        },
 *      }),
 *     ],
 * ```
 *
 * or you can also setup module passing it using a forRoot
 * be aware that if you don't pass the config it will use the default one
 *
 *
 * ```ts
 *
 *  imports: [
 *   AuthenticationModule.forRoot({
 *       imports: [TestModule],
 *       credentialLookupProvider: UserLookupService,
 *     }),
 *   ],
 * ```
 */
@Module({
  providers: [
    DefaultIssueTokenService,
    DefaultVerifyTokenService,
    JwtIssueService,
    JwtVerifyService,
  ],
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
  imports: [
    ConfigModule.forFeature(authenticationDefaultConfig),
    JwtModule.deferred({
      timeoutMessage:
        'AuthenticationModule requires JwtModule to be registered in your application.',
    }),
  ],
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
      inject: [AUTHENTICATION_MODULE_OPTIONS_TOKEN, DefaultIssueTokenService],
      useFactory: async (
        options: AuthenticationOptionsInterface,
        defaultService: DefaultIssueTokenService,
      ) => options.issueTokenService ?? defaultService,
    },
    {
      provide: VerifyTokenService,
      inject: [AUTHENTICATION_MODULE_OPTIONS_TOKEN, DefaultVerifyTokenService],
      useFactory: async (
        options: AuthenticationOptionsInterface,
        defaultService: DefaultVerifyTokenService,
      ) => options.verifyTokenService ?? defaultService,
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
