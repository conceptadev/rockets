import { Module } from '@nestjs/common';

import { UserCoreModuleFactory } from './factories/user-core-module.factory';

@Module({})
export class UserCoreModule {
  static factory = () => new UserCoreModuleFactory();
  static forRoot = UserCoreModule.factory().forRoot;
  static forRootAsync = UserCoreModule.factory().forRootAsync;
}
