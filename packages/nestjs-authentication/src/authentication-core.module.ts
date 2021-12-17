import { Module } from '@nestjs/common';

import {
  authenticationConfig,
  AUTHENTICATION_MODULE_CONFIG_TOKEN,
} from './config/authentication.config';
import { AuthenticationCoreModuleFactory } from './factories/authentication-core-module.factory';

@Module({
  providers: [
    {
      provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
      useValue: authenticationConfig(),
    },
  ],
  exports: [AUTHENTICATION_MODULE_CONFIG_TOKEN],
})
export class AuthenticationCoreModule {
  static factory = () => new AuthenticationCoreModuleFactory();
  static forRoot = AuthenticationCoreModule.factory().forRoot;
  static forRootAsync = AuthenticationCoreModule.factory().forRootAsync;
}
