import { Entity } from 'typeorm';
import { UserPostgresEntity } from '@concepta/nestjs-typeorm-ext';

@Entity()
export class UserEntity extends UserPostgresEntity {}
