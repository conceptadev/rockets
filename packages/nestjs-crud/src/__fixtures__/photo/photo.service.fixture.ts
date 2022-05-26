import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '../../services/typeorm-crud.service';
import { PhotoFixture } from './photo.entity.fixture';
import { PhotoRepositoryFixture } from './photo.repository.fixture';

/**
 * Photo CRUD service
 */
@Injectable()
export class PhotoServiceFixture extends TypeOrmCrudService<PhotoFixture> {
  constructor(
    @InjectDynamicRepository('photo')
    photoRepo: PhotoRepositoryFixture,
  ) {
    super(photoRepo);
  }
}
