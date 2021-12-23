import { Module } from '@nestjs/common';

import { JwtModuleFactory } from './factories/jwt-module.factory';

@Module({})
export class JwtModule {
  static factory = () => new JwtModuleFactory();
  static forRoot = JwtModule.factory().forRoot;
  static forRootAsync = JwtModule.factory().forRootAsync;
}
