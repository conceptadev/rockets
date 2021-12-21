import { Module } from '@nestjs/common';
import { AuthLocalCoreModuleFactory } from './factories/auth-local-core-module.factory';
import {} from './interfaces/auth-local-options.interface';

/**
 * Auth local core module
 */
@Module({})
export class AuthLocalCoreModule {
  static factory = () => new AuthLocalCoreModuleFactory();
  static forRoot = AuthLocalCoreModule.factory().forRoot;
  static forRootAsync = AuthLocalCoreModule.factory().forRootAsync;
}
