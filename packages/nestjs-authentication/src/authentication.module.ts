import { DynamicModule, Module } from '@nestjs/common';

import {
  AUTHENTICATION_MODULE_CONFIG_TOKEN,
  authenticationConfig,
} from './config/authentication.config';

import { PasswordCreationService } from './services/password-creation.service';
import { PasswordStorageService } from './services/password-storage.service';
import { PasswordStrengthService } from './services/password-strength.service';
import { AuthenticationService } from './services/authentication.service';
import {
  AuthenticationOptionsAsyncInterface,
  AuthenticationOptionsInterface,
} from './interfaces/authentication-options.interface';

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
    {
      provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
      useValue: authenticationConfig(),
    },
    PasswordCreationService,
    PasswordStrengthService,
    PasswordStorageService,
    AuthenticationService,
  ],
  exports: [
    PasswordCreationService,
    PasswordStorageService,
    PasswordStrengthService,
    AuthenticationService,
  ],
})
export class AuthenticationModule {
  public static forRoot(
    options: AuthenticationOptionsInterface,
  ): DynamicModule {
    return {
      module: AuthenticationModule,
      imports: options?.imports,
      providers: [
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        AuthenticationService,
        {
          provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
          useValue: options.config || authenticationConfig(),
        },
      ],
      exports: [
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        AuthenticationService,
      ],
    };
  }

  public static forRootAsync(
    options: AuthenticationOptionsAsyncInterface,
  ): DynamicModule {
    return {
      module: AuthenticationModule,
      imports: options?.imports,
      providers: [
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        AuthenticationService,
        {
          provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
          inject: options.config?.inject,
          useFactory: options.config.useFactory,
        },
      ],
      exports: [
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        AuthenticationService,
      ],
    };
  }
}
