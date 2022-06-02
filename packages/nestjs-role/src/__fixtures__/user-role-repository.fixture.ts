import { EntityRepository, Repository } from 'typeorm';
import { RoleTargetInterface } from '../interfaces/role-target.interface';
import { UserRoleEntityFixture } from './user-role-entity.fixture';

@EntityRepository(UserRoleEntityFixture)
export class UserRoleRepositoryFixture extends Repository<RoleTargetInterface> {}
