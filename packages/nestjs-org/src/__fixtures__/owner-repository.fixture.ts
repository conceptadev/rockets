import { EntityRepository, Repository } from 'typeorm';
import { OwnerEntityFixture } from './owner-entity.fixture';

@EntityRepository(OwnerEntityFixture)
export class OwnerRepositoryFixture extends Repository<OwnerEntityFixture> {}
