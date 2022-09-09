import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';

import { TestModuleFixture } from './test.module.fixture';
import { ormConfig } from './ormconfig.fixture';

@Module({
  imports: [TypeOrmExtModule.forRoot(ormConfig), TestModuleFixture],
})
export class AppModuleFixture {}
