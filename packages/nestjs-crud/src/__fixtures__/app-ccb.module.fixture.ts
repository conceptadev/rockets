import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { default as ormConfig } from './ormconfig.fixture';
import { CrudModule } from '../crud.module';
import { PhotoCcbModuleFixture } from './photo-ccb/photo-ccb.module.fixture';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    CrudModule.forRoot({}),
    PhotoCcbModuleFixture,
  ],
})
export class AppCcbModuleFixture {}
