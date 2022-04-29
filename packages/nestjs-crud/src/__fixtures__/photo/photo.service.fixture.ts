import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '../../services/typeorm-crud.service';
import { PHOTO_MODULE_CUSTOM_REPO_TOKEN } from './photo.constants.fixture';
import { PhotoFixture } from './photo.entity.fixture';
import { PhotoRepositoryFixture } from './photo.repository.fixture';

/**
 * Photo CRUD service
 */
@Injectable()
export class PhotoServiceFixture extends TypeOrmCrudService<PhotoFixture> {
  constructor(
    @Inject(PHOTO_MODULE_CUSTOM_REPO_TOKEN)
    photoRepo: PhotoRepositoryFixture,
  ) {
    super(photoRepo);
  }
}
