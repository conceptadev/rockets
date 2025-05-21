import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoModuleFixture } from './photo/photo.module.fixture';
import { default as ormConfig } from './ormconfig.fixture';

@Module({
  imports: [TypeOrmModule.forRoot(ormConfig), PhotoModuleFixture.register()],
})
export class AppModuleFixture {}
