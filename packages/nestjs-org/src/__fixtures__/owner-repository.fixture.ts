import { Repository } from 'typeorm';
import { OwnerEntityFixture } from './owner-entity.fixture';

export class OwnerRepositoryFixture extends Repository<OwnerEntityFixture> {}
