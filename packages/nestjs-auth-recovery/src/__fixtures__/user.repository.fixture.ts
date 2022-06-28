import { EntityRepository, Repository } from 'typeorm';
import { UserEntityInterface } from '@concepta/nestjs-user';
import { UserEntityFixture } from './user-entity.fixture';

@EntityRepository(UserEntityFixture)
export class UserRepositoryFixture extends Repository<UserEntityInterface> {}
