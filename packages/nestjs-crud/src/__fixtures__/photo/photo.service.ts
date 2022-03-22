import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '../../services/typeorm-crud.service';
import { PHOTO_MODULE_CUSTOM_REPO_TOKEN } from './photo.constants';
import { Photo } from './photo.entity';
import { PhotoRepository } from './photo.repository';

/**
 * Photo CRUD service
 */
@Injectable()
export class PhotoService extends TypeOrmCrudService<Photo> {
  constructor(
    @Inject(PHOTO_MODULE_CUSTOM_REPO_TOKEN)
    photoRepo: PhotoRepository,
  ) {
    super(photoRepo);
  }
}
