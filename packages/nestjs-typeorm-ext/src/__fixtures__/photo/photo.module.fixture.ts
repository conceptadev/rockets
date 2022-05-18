import { Module } from '@nestjs/common';
import { createConfigurableDynamicRootModule } from '@concepta/nestjs-core';
import { TypeOrmExtModule } from '../../typeorm-ext.module';
import { createEntityRepositoryProvider } from '../../utils/create-custom-entity-provider';
import { createCustomRepositoryProvider } from '../../utils/create-custom-repository-provider';
import {
  PHOTO_MODULE_CUSTOM_REPO_TOKEN,
  PHOTO_MODULE_ENTITY_REPO_TOKEN,
  PHOTO_MODULE_OPTIONS_TOKEN,
} from './photo.constants.fixture';
import { PhotoEntityFixture } from './photo.entity.fixture';
import { PhotoRepositoryFixture } from './photo.repository.fixture';

@Module({})
export class PhotoModuleFixture extends createConfigurableDynamicRootModule<
  PhotoModuleFixture,
  Record<string, unknown>
>(PHOTO_MODULE_OPTIONS_TOKEN, {
  imports: [TypeOrmExtModule.deferred()],
  providers: [
    createEntityRepositoryProvider(PHOTO_MODULE_ENTITY_REPO_TOKEN, 'photo'),
    createCustomRepositoryProvider(
      PHOTO_MODULE_CUSTOM_REPO_TOKEN,
      'photoRepository',
    ),
  ],
  exports: [PHOTO_MODULE_ENTITY_REPO_TOKEN, PHOTO_MODULE_CUSTOM_REPO_TOKEN],
}) {
  static register() {
    TypeOrmExtModule.configure({
      entities: {
        photo: { useClass: PhotoEntityFixture },
      },
      repositories: {
        photoRepository: { useClass: PhotoRepositoryFixture },
      },
    });

    return PhotoModuleFixture.forRoot(PhotoModuleFixture, {});
  }
}
