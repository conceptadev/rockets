import { Entity } from 'typeorm';
import { RoleEntityInterface } from '@concepta/nestjs-common';
import { RoleSqliteEntity } from '@concepta/nestjs-typeorm-ext';

/**
 * Role Entity Fixture
 */
@Entity()
export class RoleEntityFixture
  extends RoleSqliteEntity
  implements RoleEntityInterface {}
