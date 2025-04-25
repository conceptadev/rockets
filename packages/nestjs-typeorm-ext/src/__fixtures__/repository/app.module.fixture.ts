import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '../../typeorm-ext.module';
import { TestModuleFixture } from './test.module.fixture';
import { ormConfig } from './ormconfig.fixture';

@Module({
  imports: [TypeOrmExtModule.forRoot(ormConfig), TestModuleFixture],
})
export class AppModuleFixture {}
