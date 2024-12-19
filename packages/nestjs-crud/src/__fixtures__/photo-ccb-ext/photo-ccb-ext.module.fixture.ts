import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';

import { PhotoFixture } from '../photo/photo.entity.fixture';

import {
  PhotoCcbExtControllerFixture,
  PhotoCcbExtCrudServiceFixture,
  PHOTO_CRUD_SERVICE_TOKEN,
} from './photo-ccb-ext.controller.fixture';

@Module({
  imports: [
    TypeOrmExtModule.forFeature({
      photo: {
        entity: PhotoFixture,
      },
    }),
  ],
  providers: [
    {
      provide: PHOTO_CRUD_SERVICE_TOKEN,
      useClass: PhotoCcbExtCrudServiceFixture,
    },
  ],
  controllers: [PhotoCcbExtControllerFixture],
})
export class PhotoCcbExtModuleFixture {}
