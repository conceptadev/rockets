import { DynamicModule, Module } from '@nestjs/common';
import {
  createCustomRepositoryProvider,
  createEntityRepositoryProvider,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '../../crud.module';
import {
  PHOTO_MODULE_CUSTOM_REPO_TOKEN,
  PHOTO_MODULE_ENTITY_REPO_TOKEN,
} from './photo.constants.fixture';
import { PhotoControllerFixture } from './photo.controller.fixture';
import { PhotoFixture } from './photo.entity.fixture';
import { PhotoRepositoryFixture } from './photo.repository.fixture';
import { PhotoServiceFixture } from './photo.service.fixture';

@Module({
  providers: [PhotoServiceFixture],
  controllers: [PhotoControllerFixture],
})
export class PhotoModuleFixture {
  static register(): DynamicModule {
    TypeOrmExtModule.configure(
      {},
      {
        entities: {
          photo: { useClass: PhotoFixture },
        },
        repositories: {
          photoRepository: { useClass: PhotoRepositoryFixture },
        },
      },
    );

    return {
      module: PhotoModuleFixture,
      imports: [CrudModule.register()],
      providers: [
        createEntityRepositoryProvider(PHOTO_MODULE_ENTITY_REPO_TOKEN, 'photo'),
        createCustomRepositoryProvider(
          PHOTO_MODULE_CUSTOM_REPO_TOKEN,
          'photoRepository',
        ),
      ],
      exports: [PHOTO_MODULE_ENTITY_REPO_TOKEN, PHOTO_MODULE_CUSTOM_REPO_TOKEN],
    };
  }
}
