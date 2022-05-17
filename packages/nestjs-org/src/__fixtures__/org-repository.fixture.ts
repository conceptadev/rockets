import { EntityRepository, Repository } from 'typeorm';
import { OrgEntityInterface } from '../interfaces/org-entity.interface';
import { OrgEntityFixture } from './org-entity.fixture';

@EntityRepository(OrgEntityFixture)
export class OrgRepositoryFixture extends Repository<OrgEntityInterface> {}
