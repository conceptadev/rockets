import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { UserRoleEntityFixture } from './user-role-entity.fixture';

/**
 * User Entity Fixture
 */
@Entity()
export class UserEntityFixture implements ReferenceIdInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => UserRoleEntityFixture, (userRole) => userRole.assignee)
  userRoles: UserRoleEntityFixture[];
}
