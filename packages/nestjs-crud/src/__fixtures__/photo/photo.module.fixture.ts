import { DynamicModule, Module } from '@nestjs/common';
import { CrudModule } from '../../crud.module';

import { PhotoControllerFixture } from './photo.controller.fixture';
import { PhotoFixture } from './photo.entity.fixture';
import { PhotoServiceFixture } from './photo.service.fixture';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [PhotoServiceFixture],
  controllers: [PhotoControllerFixture],
})
export class PhotoModuleFixture {
  static register(): DynamicModule {
    return {
      module: PhotoModuleFixture,
      imports: [
        CrudModule.forRoot({}),
        TypeOrmModule.forFeature([PhotoFixture]),
      ],
    };
  }
}
