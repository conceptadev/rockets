import { EntityRepository, Repository } from 'typeorm';
import { PhotoFixture } from './photo.entity.fixture';

@EntityRepository(PhotoFixture)
export class PhotoRepositoryFixture extends Repository<PhotoFixture> {}
