import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { default as ormConfig } from './ormconfig.fixture';
import { CrudModule } from '../crud.module';
import { PhotoCcbCustomModuleFixture } from './photo-ccb-custom/photo-ccb-custom.module.fixture';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    CrudModule.forRoot({}),
    PhotoCcbCustomModuleFixture,
  ],
})
export class AppCcbCustomModuleFixture {}
