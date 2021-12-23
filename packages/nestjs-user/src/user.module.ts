import { Module } from '@nestjs/common';

import { UserModuleFactory } from './factories/user-module.factory';

@Module({})
export class UserModule {
  static factory = () => new UserModuleFactory();
  static forRoot = UserModule.factory().forRoot;
  static forRootAsync = UserModule.factory().forRootAsync;
}
