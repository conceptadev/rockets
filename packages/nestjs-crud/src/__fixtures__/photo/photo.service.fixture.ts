import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-common';
import { TypeOrmCrudService } from '../../services/typeorm-crud.service';
import { PhotoFixture } from './photo.entity.fixture';

/**
 * Photo CRUD service
 */
@Injectable()
export class PhotoServiceFixture extends TypeOrmCrudService<PhotoFixture> {
  constructor(
    @InjectDynamicRepository('photo')
    photoRepo: Repository<PhotoFixture>,
  ) {
    super(photoRepo);
  }
}
