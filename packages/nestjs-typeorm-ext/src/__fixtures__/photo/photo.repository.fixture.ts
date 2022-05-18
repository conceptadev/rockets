import { EntityRepository, Repository } from 'typeorm';
import { PhotoEntityFixture } from './photo.entity.fixture';

@EntityRepository(PhotoEntityFixture)
export class PhotoRepositoryFixture extends Repository<PhotoEntityFixture> {}
