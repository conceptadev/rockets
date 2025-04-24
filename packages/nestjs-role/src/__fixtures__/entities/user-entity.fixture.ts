import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ReferenceIdInterface } from '@concepta/nestjs-common';

/**
 * User Entity Fixture
 */
@Entity()
export class UserEntityFixture implements ReferenceIdInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
