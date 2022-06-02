import { EntityRepository, Repository } from 'typeorm';
import { RoleTargetInterface } from '../interfaces/role-target.interface';
import { OrgMemberRoleEntityFixture } from './org-member-role-entity.fixture';

@EntityRepository(OrgMemberRoleEntityFixture)
export class OrgMemberRoleRepositoryFixture extends Repository<RoleTargetInterface> {}
