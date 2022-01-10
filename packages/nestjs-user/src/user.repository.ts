import { EntityRepository, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserInterface } from './interfaces/user.interface';

@EntityRepository(User)
export class UserRepository extends Repository<UserInterface> {}
