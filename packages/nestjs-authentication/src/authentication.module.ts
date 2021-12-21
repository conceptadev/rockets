import { Module } from '@nestjs/common';

import { AuthenticationModuleFactory } from './factories/authentication-module.factory';

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
@Module({})
export class AuthenticationModule {
  static factory = () => new AuthenticationModuleFactory();
  static forRoot = AuthenticationModule.factory().forRoot;
  static forRootAsync = AuthenticationModule.factory().forRootAsync;
}
