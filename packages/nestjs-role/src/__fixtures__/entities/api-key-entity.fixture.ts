import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { ApiKeyRoleEntityFixture } from './api-key-role-entity.fixture';

/**
 * Api Key Entity Fixture
 */
@Entity()
export class ApiKeyEntityFixture implements ReferenceIdInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => ApiKeyRoleEntityFixture, (apiKeyRole) => apiKeyRole.assignee)
  apiKeyRoles!: string;
}
