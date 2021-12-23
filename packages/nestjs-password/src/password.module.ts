import { Module } from '@nestjs/common';

import { PasswordModuleFactory } from './factories/password-module.factory';

/**
 * 
 */
@Module({})
export class PasswordModule {
  static factory = () => new PasswordModuleFactory();
  static forRoot = PasswordModule.factory().forRoot;
  static forRootAsync = PasswordModule.factory().forRootAsync;
}
