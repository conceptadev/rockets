import { DynamicModule, Module } from '@nestjs/common';

import {
    AUTHENTICATION_MODULE_CONFIG_TOKEN, authenticationConfig, CREDENTIAL_LOOKUP_SERVICE_TOKEN
} from './config/authentication.config';
import {
    AuthenticationOptionsAsyncInterface, AuthenticationOptionsInterface
} from './interface/authentication-options.interface';
import { PasswordCreationService } from './services/password-creation.service';
import { PasswordStorageService } from './services/password-storage.service';
import { PasswordStrengthService } from './services/password-strength.service';
import { SignService } from './services/sign.service';
import { SignController } from './sign.controller';

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
 *       AuthenticationModule.forRootAsync({
 *         credentialLookupProvider: {
 *           imports:[TestModule],
 *           inject:[UserLookupService],
 *           useFactory: async (userService: UserService) => {
 *             return new UserLookupService(userService);
 *           }
 *         }
 *       })
 *     ],
 * ```
 * 
 * or you can also setup module passing it using a forRoot
 * 
 * ```ts
 *  imports: [
      AuthenticationModule.forRoot({
        credentialLookupService: new UserLookupService()
      })
    ],
 * ```
 */
@Module({
  providers: [
    {
      provide: authenticationConfig.KEY,
      useValue: authenticationConfig(),
    },
    PasswordCreationService,
    PasswordStrengthService,
    PasswordStorageService,
    SignService,
    SignController
  ],
  exports: [
    PasswordCreationService,
    PasswordStorageService,
    PasswordStrengthService,
    SignController
  ],
  controllers: [
    SignController
  ],
})
export class AuthenticationModule {
  public static forRoot(options: AuthenticationOptionsInterface): DynamicModule {
    return {
      module: AuthenticationModule,
      providers: [
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        SignService,
        SignController,
        {
          provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
          useValue: options.config || authenticationConfig(),
        },
        {
          provide: CREDENTIAL_LOOKUP_SERVICE_TOKEN,
          useValue: options.credentialLookupService
        }
      ],
      exports: [
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        SignController,
        SignService
      ],
      controllers: [
          SignController,
        ],
    };
  }

  public static forRootAsync(options: AuthenticationOptionsAsyncInterface): DynamicModule {
    return {
      module: AuthenticationModule,
      imports:[...options.credentialLookupProvider?.imports],
      providers: [
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        SignService,
        SignController,
        {
          provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
          useValue: options.config || authenticationConfig(),
        },
        {
          provide: CREDENTIAL_LOOKUP_SERVICE_TOKEN,
          inject: options.credentialLookupProvider?.inject,
          useFactory: options.credentialLookupProvider?.useFactory
        }
      ],
      exports: [
        PasswordStrengthService,
        PasswordStorageService,
        PasswordCreationService,
        SignController,
        SignService
      ],
      controllers: [
          SignController,
        ],
    };
  }
}
