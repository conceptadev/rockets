import { EntityRepository, Repository } from 'typeorm';
import { RoleEntityInterface } from '../../interfaces/role-entity.interface';
import { RoleEntityFixture } from '../entities/role-entity.fixture';

@EntityRepository(RoleEntityFixture)
export class RoleRepositoryFixture extends Repository<RoleEntityInterface> {}
