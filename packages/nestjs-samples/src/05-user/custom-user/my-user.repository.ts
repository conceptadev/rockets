import { EntityRepository, Repository } from 'typeorm';
import { MyUser } from './my-user.entity';

@EntityRepository(MyUser)
export class MyUserRepository extends Repository<MyUser> {}
