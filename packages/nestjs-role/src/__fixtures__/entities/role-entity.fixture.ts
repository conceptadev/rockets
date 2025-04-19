import { Entity } from 'typeorm';
import { RoleSqliteEntity } from '../../entities/role-sqlite.entity';
import { RoleEntityInterface } from '../../interfaces/role-entity.interface';

/**
 * Role Entity Fixture
 */
@Entity()
export class RoleEntityFixture
  extends RoleSqliteEntity
  implements RoleEntityInterface {}
