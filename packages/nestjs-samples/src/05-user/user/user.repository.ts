import { UserEntityInterface } from '@concepta/nestjs-user';
import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntityInterface> {}
