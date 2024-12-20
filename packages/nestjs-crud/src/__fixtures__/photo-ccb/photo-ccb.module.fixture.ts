import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PhotoFixture } from '../photo/photo.entity.fixture';
import {
  PhotoCcbControllerFixture,
  PhotoCcbCrudServiceFixture,
  PHOTO_CRUD_SERVICE_TOKEN,
} from './photo-ccb.controller.fixture';

@Module({
  imports: [TypeOrmModule.forFeature([PhotoFixture])],
  providers: [
    {
      provide: PHOTO_CRUD_SERVICE_TOKEN,
      useClass: PhotoCcbCrudServiceFixture,
    },
  ],
  controllers: [PhotoCcbControllerFixture],
})
export class PhotoCcbModuleFixture {}
