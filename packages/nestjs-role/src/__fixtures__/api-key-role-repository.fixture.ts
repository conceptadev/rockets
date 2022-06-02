import { EntityRepository, Repository } from 'typeorm';
import { RoleTargetInterface } from '../interfaces/role-target.interface';
import { ApiKeyRoleEntityFixture } from './api-key-role-entity.fixture';

@EntityRepository(ApiKeyRoleEntityFixture)
export class ApiKeyRoleRepositoryFixture extends Repository<RoleTargetInterface> {}
