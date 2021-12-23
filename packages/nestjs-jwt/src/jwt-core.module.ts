import { Module } from '@nestjs/common';

import { JwtCoreModuleFactory } from './factories/jwt-core-module.factory';

@Module({})
export class JwtCoreModule {
  static factory = () => new JwtCoreModuleFactory();
  static forRoot = JwtCoreModule.factory().forRoot;
  static forRootAsync = JwtCoreModule.factory().forRootAsync;
}
