import { EntityRepository, Repository } from 'typeorm';
import { UserRoleEntityFixture } from '../entities/user-role-entity.fixture';

@EntityRepository(UserRoleEntityFixture)
export class UserRoleRepositoryFixture extends Repository<UserRoleEntityFixture> {}
