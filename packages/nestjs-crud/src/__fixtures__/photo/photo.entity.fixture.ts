import { ReferenceId } from '@concepta/nestjs-common';
import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PhotoEntityInterfaceFixture } from './interfaces/photo-entity.interface.fixture';

@Entity()
export class PhotoFixture implements PhotoEntityInterfaceFixture {
  @PrimaryGeneratedColumn('uuid')
  id: ReferenceId;

  @Column({ length: 500 })
  name: string;

  @Column('text')
  description: string;

  @Column()
  filename: string;

  @Column('int', { default: 0 })
  views: number;

  @Column()
  isPublished: boolean;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
