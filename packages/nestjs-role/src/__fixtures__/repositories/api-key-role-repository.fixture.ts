import { EntityRepository, Repository } from 'typeorm';
import { ApiKeyRoleEntityFixture } from '../entities/api-key-role-entity.fixture';

@EntityRepository(ApiKeyRoleEntityFixture)
export class ApiKeyRoleRepositoryFixture extends Repository<ApiKeyRoleEntityFixture> {}
