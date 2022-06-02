import { EntityRepository, Repository } from 'typeorm';
import { UserRoleEntityFixture } from './user-role-entity.fixture';

@EntityRepository(UserRoleEntityFixture)
export class UserRoleRepositoryFixture extends Repository<UserRoleEntityFixture> {}
