import { EntityRepository, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserEntityInterface } from './interfaces/user-entity.interface';

/**
 * User Repository
 */
@EntityRepository(User)
export class UserRepository extends Repository<UserEntityInterface> {}
