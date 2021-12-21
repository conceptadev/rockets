import { Module } from '@nestjs/common';

import { AuthenticationCoreModuleFactory } from './factories/authentication-core-module.factory';

@Module({})
export class AuthenticationCoreModule {
  static factory = () => new AuthenticationCoreModuleFactory();
  static forRoot = AuthenticationCoreModule.factory().forRoot;
  static forRootAsync = AuthenticationCoreModule.factory().forRootAsync;
}
