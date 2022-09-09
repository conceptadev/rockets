import { Module } from '@nestjs/common';
import { createConfigurableDynamicRootModule } from '@concepta/nestjs-core';
import { TypeOrmExtModule } from '../../typeorm-ext.module';
import { PHOTO_MODULE_OPTIONS_TOKEN } from './photo.constants.fixture';
import { PhotoEntityFixture } from './photo.entity.fixture';
import { createPhotoRepositoryFixture } from './photo.repository.fixture';

@Module({})
export class PhotoModuleFixture extends createConfigurableDynamicRootModule<
  PhotoModuleFixture,
  Record<string, unknown>
>(PHOTO_MODULE_OPTIONS_TOKEN) {
  static register() {
    const module = PhotoModuleFixture.forRoot(PhotoModuleFixture, {});

    if (!module?.imports) {
      module.imports = [];
    }

    module.imports.push(
      TypeOrmExtModule.forFeature({
        photo: {
          entity: PhotoEntityFixture,
          repositoryFactory: createPhotoRepositoryFixture,
        },
      }),
    );

    return module;
  }
}
