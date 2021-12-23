import { Module } from '@nestjs/common';

import { PasswordCoreModuleFactory } from './factories/password-core-module.factory';

@Module({})
export class PasswordCoreModule {
  static factory = () => new PasswordCoreModuleFactory();
  static forRoot = PasswordCoreModule.factory().forRoot;
  static forRootAsync = PasswordCoreModule.factory().forRootAsync;
}
