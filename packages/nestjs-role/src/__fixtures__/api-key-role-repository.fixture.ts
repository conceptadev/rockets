import { EntityRepository, Repository } from 'typeorm';
import { ApiKeyRoleEntityFixture } from './api-key-role-entity.fixture';

@EntityRepository(ApiKeyRoleEntityFixture)
export class ApiKeyRoleRepositoryFixture extends Repository<ApiKeyRoleEntityFixture> {}
