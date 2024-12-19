import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PhotoFixture } from '../photo/photo.entity.fixture';

import {
  PhotoCcbCustomControllerFixture,
  PhotoCcbCustomCrudServiceFixture,
  PHOTO_CRUD_SERVICE_TOKEN,
} from './photo-ccb-custom.controller.fixture';

@Module({
  imports: [TypeOrmModule.forFeature([PhotoFixture])],
  providers: [
    {
      provide: PHOTO_CRUD_SERVICE_TOKEN,
      useClass: PhotoCcbCustomCrudServiceFixture,
    },
  ],
  controllers: [PhotoCcbCustomControllerFixture],
})
export class PhotoCcbCustomModuleFixture {}
