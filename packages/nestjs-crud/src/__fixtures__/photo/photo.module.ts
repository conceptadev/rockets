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
} from './photo.constants';
import { PhotoController } from './photo.controller';
import { Photo } from './photo.entity';
import { PhotoRepository } from './photo.repository';
import { PhotoService } from './photo.service';

@Module({
  providers: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {
  static register(): DynamicModule {
    TypeOrmExtModule.configure(
      {},
      {
        entities: {
          photo: { useClass: Photo },
        },
        repositories: {
          photoRepository: { useClass: PhotoRepository },
        },
      },
    );

    return {
      module: PhotoModule,
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
