import { Module } from '@nestjs/common';

import { AuthLocalModuleFactory } from './factories/auth-local-module.factory';

/**
 * Auth local module
 */
@Module({})
export class AuthLocalModule {
  static factory = () => new AuthLocalModuleFactory();
  static forRoot = AuthLocalModule.factory().forRoot;
  static forRootAsync = AuthLocalModule.factory().forRootAsync;
}
