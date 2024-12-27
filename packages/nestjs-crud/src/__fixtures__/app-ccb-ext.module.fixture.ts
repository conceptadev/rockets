import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { default as ormConfig } from './ormconfig.fixture';
import { CrudModule } from '../crud.module';
import { PhotoCcbExtModuleFixture } from './photo-ccb-ext/photo-ccb-ext.module.fixture';

@Module({
  imports: [
    TypeOrmExtModule.forRoot(ormConfig),
    CrudModule.forRoot({}),
    PhotoCcbExtModuleFixture,
  ],
})
export class AppCcbExtModuleFixture {}
