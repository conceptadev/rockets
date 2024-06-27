import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '../../typeorm-ext.module';
import { PhotoEntityFixture } from './photo.entity.fixture';
import { createPhotoRepositoryFixture } from './photo.repository.fixture';

@Module({
  imports: [
    TypeOrmExtModule.forFeature({
      photo: {
        entity: PhotoEntityFixture,
        repositoryFactory: createPhotoRepositoryFixture,
      },
    }),
  ],
})
export class PhotoModuleFixture {}
