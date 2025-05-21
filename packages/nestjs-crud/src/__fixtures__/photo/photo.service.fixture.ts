import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '../../services/typeorm-crud.service';
import { PhotoFixture } from './photo.entity.fixture';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * Photo CRUD service
 */
@Injectable()
export class PhotoServiceFixture extends TypeOrmCrudService<PhotoFixture> {
  constructor(
    @InjectRepository(PhotoFixture)
    photoRepo: Repository<PhotoFixture>,
  ) {
    super(photoRepo);
  }
}
